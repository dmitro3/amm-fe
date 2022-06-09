/* eslint-disable @typescript-eslint/no-unused-vars */
import Str from '@ledgerhq/hw-app-str';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signTransaction } from '@stellar/freighter-api';
import BigNumber from 'bignumber.js';
import * as crypto from 'crypto';
import { creditAbi } from 'src/constants/abi/creditAbi';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import { WarpTransferType } from 'src/features/ConnectWallet/constants/warpTransferType';
import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import { STELLAR_DECIMAL } from 'src/features/OrderForm/constants/order';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import { warpInit, warpStart } from 'src/features/OrderForm/services';
import {
  Account,
  Asset,
  FeeBumpTransaction,
  Keypair,
  Memo,
  Operation,
  Server,
  Transaction,
  TransactionBuilder,
} from 'stellar-sdk';
import TrezorConnect from 'trezor-connect';
import Web3 from 'web3';

const TimeoutInfinite = 0;

export enum WarpStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const warpFromBscToStellar = async (
  bscAddress: string,
  stellarAddress: string,
  typeId: number,
  amount: string | number | BigNumber,
  tokenAddressInBsc: string,
  tokenDecimal: string | number | BigNumber,
): Promise<void> => {
  if (window.web3) {
    try {
      // console.log(new BigNumber(amount).toString());
      // console.log('run warp');
      // init web3
      const web3 = new Web3(window.web3.currentProvider);
      // hermes
      const creditContractAddress = process.env.REACT_APP_WARP_EXCHANGE_ADDRESS_BSC || '';
      // @ts-ignore
      const creditContract = new web3.eth.Contract(creditAbi, creditContractAddress);
      let a = new BigNumber(new BigNumber(amount).dp(STELLAR_DECIMAL));

      // call api to init data
      const initResponse = await warpInit(
        WarpTransferType.BscToStellar,
        bscAddress.toLowerCase(),
        stellarAddress,
        typeId,
        a.toString(),
      );

      // check lock
      if (tokenDecimal && new BigNumber(tokenDecimal).gt(0)) {
        a = a.times(new BigNumber(10).pow(tokenDecimal));
      }
      // get integer number
      a = a.dp(0, BigNumber.ROUND_UP);

      const hash = crypto.createHash('sha256').update(stellarAddress).digest('hex');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const gas = await creditContract.methods
        .lock(typeId, bscAddress, a.toString(), `0x${hash}`)
        .estimateGas({ from: bscAddress });

      let status: any;
      const tx = await creditContract.methods
        .lock(typeId, bscAddress, a.toString(), `0x${hash}`)
        .send({ from: bscAddress })
        .on('transactionHash', async (tx_hash: string) => {
          // console.log('hash: ', tx_hash);
          // call api to send hash to sever
          const startResponse = await warpStart(initResponse.id, tx_hash);
          if (startResponse.status !== WarpStatus.COMPLETED) {
            status = WarpStatus.FAILED;
          }
        });
      if (status === WarpStatus.FAILED) {
        throw new Error(status);
      }
    } catch (e) {
      // console.log(e);
      throw e;
    }
  }
};

export const warpFromStellarToBsc = async (
  stellarAddress: string,
  bscAddress: string,
  typeId: number,
  amount: string | number | BigNumber,
  assets: Asset,
  wallet: WalletData,
): Promise<void> => {
  try {
    // console.log(new BigNumber(amount).toString());
    // console.log('run warp');

    // get data from stellar
    let path;
    let hardwareWalletType;
    let publicKey;
    let isFreighter;
    if (wallet.freighter) {
      path = null;
      hardwareWalletType = null;
      publicKey = wallet.freighter;
      isFreighter = true;
    } else if (wallet.trezor.publicKey) {
      path = wallet.trezor.path;
      hardwareWalletType = HardwareWalletType.TREZOR;
      publicKey = wallet.trezor.publicKey;
      isFreighter = false;
    } else if (wallet.ledger.publicKey) {
      path = wallet.ledger.path;
      hardwareWalletType = HardwareWalletType.LEDGER;
      publicKey = wallet.ledger.publicKey;
      isFreighter = false;
    } else {
      path = null;
      hardwareWalletType = null;
      publicKey = null;
      isFreighter = false;
    }
    const secret = wallet.privateKey;

    // hermes
    const creditAddress = process.env.REACT_APP_WARP_EXCHANGE_ADDRESS_STELLAR || '';
    const hermesHost = process.env.REACT_APP_WARP_HOST || '';
    const hash = crypto.createHash('sha256').update(bscAddress.toLowerCase()).digest('hex');
    const a = new BigNumber(amount).dp(STELLAR_DECIMAL, BigNumber.ROUND_UP);
    // console.log('new amount', a.toString());

    // // call api to init data
    const initResponse = await warpInit(
      WarpTransferType.StellarToBsc,
      stellarAddress,
      bscAddress.toLowerCase(),
      typeId,
      amount.toString(),
    );

    // lock in stellar
    const keyPair = publicKey ? Keypair.fromPublicKey(publicKey) : Keypair.fromSecret(secret || '');
    const server = new Server(process.env.REACT_APP_HORIZON || '');
    const fee = await server.fetchBaseFee();
    const account = await server.loadAccount(keyPair.publicKey());
    const sourceAccount = new Account(account.accountId(), account.sequenceNumber().toString());

    let transaction: Transaction | FeeBumpTransaction = new TransactionBuilder(sourceAccount, {
      fee: fee.toString(),
      networkPassphrase: process.env.REACT_APP_NETWORK_PASSPHRASE,
      memo: Memo.hash(hash),
    })
      .addOperation(
        Operation.payment({
          destination: creditAddress,
          amount: a.toString(),
          asset: assets,
        }),
      )
      .setTimeout(TimeoutInfinite)
      .build();

    // sign
    if (hardwareWalletType === HardwareWalletType.TREZOR) {
      try {
        const trezorTransaction = transformTrezorTransaction(path || Trezor.defaultStellarPath, transaction);
        const result = await TrezorConnect.stellarSignTransaction(trezorTransaction);
        if (result.success) {
          // convert hex to base64
          const signature = Buffer.from(result.payload.signature, 'hex').toString('base64');
          transaction.addSignature(keyPair.publicKey(), signature);
        }
      } catch (e) {
        throw e;
      }
    } else if (hardwareWalletType === HardwareWalletType.LEDGER) {
      try {
        const transport = await TransportWebUSB.request();
        const str = new Str(transport);
        const result = await str.signTransaction(path || Ledger.defaultStellarPath, transaction.signatureBase());
        // convert uint8array to base64
        const signature = Buffer.from(result.signature).toString('base64');
        transaction.addSignature(keyPair.publicKey(), signature);
      } catch (e) {
        throw e;
      }
    } else if (isFreighter) {
      const network = process.env.REACT_APP_STELLAR_NETWORK === 'PUBLIC' ? 'PUBLIC' : 'TESTNET';
      const signedTransactionXDR = await signTransaction(transaction.toXDR(), network);
      transaction = TransactionBuilder.fromXDR(signedTransactionXDR, `${process.env.REACT_APP_HORIZON}`);
    } else {
      transaction.sign(keyPair);
    }

    // console.log('xdr:', transaction.toXDR());
    const tx_hash = transaction.toXDR();
    // call api to send hash to sever
    const startResponse = await warpStart(initResponse.id, tx_hash);
    if (startResponse.status !== WarpStatus.COMPLETED) {
      throw new Error(WarpStatus.FAILED);
    }
  } catch (e) {
    // console.log(e);
    throw e;
  }
};
