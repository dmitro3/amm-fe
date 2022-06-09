import Str from '@ledgerhq/hw-app-str';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { signTransaction } from '@stellar/freighter-api';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import { HardwareWalletData } from 'src/features/ConnectWallet/interfaces/HardwareWalletData';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import { stellarTxTimeout } from 'src/features/OrderForm/constants/stellar';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import {
  Account,
  Asset,
  FeeBumpTransaction,
  Keypair,
  Operation,
  Server,
  Transaction,
  TransactionBuilder,
} from 'stellar-sdk';
import TrezorConnect from 'trezor-connect';

export const trustAllAssets = async (
  walletAddressForTrustline: {
    freighter: string;
    trezor: HardwareWalletData;
    ledger: HardwareWalletData;
    privateKey: string;
  },
  assets: Array<Asset>,
): Promise<any> => {
  let path;
  let hardwareWalletType;
  let publicKey;
  let isFreighter;
  if (walletAddressForTrustline.freighter) {
    path = null;
    hardwareWalletType = null;
    publicKey = walletAddressForTrustline.freighter;
    isFreighter = true;
  } else if (walletAddressForTrustline.trezor.publicKey) {
    path = walletAddressForTrustline.trezor.path;
    hardwareWalletType = HardwareWalletType.TREZOR;
    publicKey = walletAddressForTrustline.trezor.publicKey;
    isFreighter = false;
  } else if (walletAddressForTrustline.ledger.publicKey) {
    path = walletAddressForTrustline.ledger.path;
    hardwareWalletType = HardwareWalletType.LEDGER;
    publicKey = walletAddressForTrustline.ledger.publicKey;
    isFreighter = false;
  } else {
    path = null;
    hardwareWalletType = null;
    publicKey = null;
    isFreighter = false;
  }
  const secret = walletAddressForTrustline.privateKey;

  const keyPair = publicKey ? Keypair.fromPublicKey(publicKey) : Keypair.fromSecret(secret || '');
  const server = new Server(`${process.env.REACT_APP_HORIZON}`);
  const account = await server.loadAccount(keyPair.publicKey());
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  const fee = (await server.fetchBaseFee()).toString();
  const networkPassphrase = process.env.REACT_APP_NETWORK_PASSPHRASE;
  // TODO: trust all

  const rawTx = new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase,
  });

  if (assets.length) {
    for (const asset of assets) {
      rawTx.addOperation(Operation.changeTrust({ asset }));
    }
    let transaction: Transaction | FeeBumpTransaction = rawTx.setTimeout(stellarTxTimeout).build();

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

    // submit
    try {
      return await server.submitTransaction(transaction);
    } catch (e) {
      throw e.response.data.extras.result_codes.operations;
    }
  }
};
