import { stellarTxTimeout } from 'src/features/OrderForm/constants/stellar';
import { Account, Keypair, Operation, Server, TransactionBuilder } from 'stellar-sdk';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import { getAsset } from 'src/features/OrderForm/helpers/sendStellarOffer';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import TrezorConnect from 'trezor-connect';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Str from '@ledgerhq/hw-app-str';
import { getStellarAssetType } from 'src/features/Orderbook/helpers/orderbookHelper';
import { STELLAR_ASSET_TYPE } from 'src/features/Orderbook/constants/FomartDataValue';
import { TrustLineParam } from 'src/features/OrderForm/interfaces/TrustLineParam';

const server = new Server(`${process.env.REACT_APP_HORIZON}`);
const networkPassphrase = process.env.REACT_APP_NETWORK_PASSPHRASE;

export const isTrusted = async (param: TrustLineParam): Promise<boolean> => {
  const asset_type_string = getStellarAssetType(param.assetType);
  const keyPair = param.secret
    ? Keypair.fromSecret(param.secret)
    : param.publicKey
    ? Keypair.fromPublicKey(param.publicKey)
    : null;
  if (keyPair) {
    const account = await server.loadAccount(keyPair.publicKey());
    const balances = account.balances;
    if (param.assetType === STELLAR_ASSET_TYPE.NATIVE) {
      return true;
    } else {
      const data = balances.filter((balance: any) => {
        return (
          balance.asset_type === asset_type_string &&
          balance.asset_code === param.symbol &&
          balance.asset_issuer === param.issuer
        );
      });
      return data.length === 1;
    }
  }
  return false;
};

export const changeTrust = async (param: TrustLineParam): Promise<any> => {
  const keyPair = param.secret
    ? Keypair.fromSecret(param.secret)
    : param.publicKey
    ? Keypair.fromPublicKey(param.publicKey)
    : null;
  const asset = getAsset(param.symbol, param.issuer, param.assetType);
  if (keyPair) {
    const account = await server.loadAccount(keyPair.publicKey());
    const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
    const fee = (await server.fetchBaseFee()).toString();
    const transaction = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset,
        }),
      )
      .setTimeout(stellarTxTimeout)
      .build();

    if (param.hardwareWalletType === HardwareWalletType.TREZOR) {
      try {
        const trezorTransaction = transformTrezorTransaction(param.path || Trezor.defaultStellarPath, transaction);
        const result = await TrezorConnect.stellarSignTransaction(trezorTransaction);
        if (result.success) {
          // convert to base64
          const signature = Buffer.from(result.payload.signature, 'hex').toString('base64');
          transaction.addSignature(keyPair.publicKey(), signature);
        }
      } catch (e) {
        throw e;
      }
    } else if (param.hardwareWalletType === HardwareWalletType.LEDGER) {
      try {
        const transport = await TransportWebUSB.request();
        const str = new Str(transport);
        const result = await str.signTransaction(param.path || Ledger.defaultStellarPath, transaction.signatureBase());
        // convert uint8array to base64
        const signature = Buffer.from(result.signature).toString('base64');
        transaction.addSignature(keyPair.publicKey(), signature);
      } catch (e) {
        throw e;
      }
    } else {
      transaction.sign(keyPair);
    }

    // submit
    try {
      return await server.submitTransaction(transaction);
    } catch (e) {
      throw e.response.data.extras.result_codes.operations || e.response.data.extras.result_codes.transaction;
    }
  }
};

export default { isTrusted, changeTrust };
