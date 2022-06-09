import { signTransaction } from '@stellar/freighter-api';
import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { Account, Asset, FeeBumpTransaction, Keypair, Server, Transaction, TransactionBuilder } from 'stellar-sdk';
import { buildTxCreateBuyOffer } from 'src/features/OrderForm/helpers/sendStellarOffer';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import TrezorConnect from 'trezor-connect';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Str from '@ledgerhq/hw-app-str';
import { Pair } from 'src/features/Pairs/interfaces/pair';

export const cancelStellarOffer = async (offerId: string, wallet: WalletData, pair?: Pair | null): Promise<any> => {
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

  const keyPair = publicKey ? Keypair.fromPublicKey(publicKey) : Keypair.fromSecret(secret || '');
  const server = new Server(`${process.env.REACT_APP_HORIZON}`);
  const account = await server.loadAccount(keyPair.publicKey());
  const baseAsset = pair ? new Asset(pair.base_symbol, pair.base_stellar_issuer) : Asset.native();
  const targetAsset = pair ? new Asset(pair.quote_symbol, pair.quote_stellar_issuer) : Asset.native();
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  let transaction: Transaction | FeeBumpTransaction = await buildTxCreateBuyOffer(
    0,
    1,
    baseAsset,
    targetAsset,
    sourceAccount,
    null,
    offerId,
  );

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
    throw e.response.data.extras.result_codes.operations || e.response.data.extras.result_codes.transaction;
  }
};
