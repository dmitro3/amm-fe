import { signTransaction } from '@stellar/freighter-api';
import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { STELLAR_DECIMAL } from 'src/features/OrderForm/constants/order';
import { stellarTxTimeout } from 'src/features/OrderForm/constants/stellar';
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
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import TrezorConnect from 'trezor-connect';
import BigNumber from 'bignumber.js';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import Str from '@ledgerhq/hw-app-str';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { STELLAR_ASSET_TYPE } from '../../Orderbook/constants/FomartDataValue';

const server = new Server(`${process.env.REACT_APP_HORIZON}`);
const networkPassphrase = process.env.REACT_APP_NETWORK_PASSPHRASE;
const offerIdForNewOffer = '0';

export const getAsset = (symbol: string, issuer: string, type: number): Asset => {
  return type === STELLAR_ASSET_TYPE.NATIVE ? Asset.native() : new Asset(symbol, issuer);
};

export const buildTxCreateBuyOffer = async (
  amount: number | string | BigNumber,
  price: number | string | BigNumber,
  baseAsset: Asset,
  targetAsset: Asset,
  sourceAccount: Account,
  hardwareWalletType: HardwareWalletType | null,
  offerId = '0',
  exchangeFeeRate = '0',
): Promise<Transaction> => {
  const fee = (await server.fetchBaseFee()).toString();

  // with fee
  if (new BigNumber(exchangeFeeRate).gt('0')) {
    if (hardwareWalletType === HardwareWalletType.TREZOR || hardwareWalletType === HardwareWalletType.LEDGER) {
      return new TransactionBuilder(sourceAccount, {
        fee,
        networkPassphrase,
      })
        .addOperation(
          Operation.manageSellOffer({
            buying: baseAsset,
            selling: targetAsset,
            amount: new BigNumber(amount)
              .times(price)
              .times(new BigNumber(1).minus(exchangeFeeRate))
              .dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN)
              .toString(),
            price: new BigNumber(1).dividedBy(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_UP).toString(),
            offerId,
          }),
        )
        .addOperation(
          Operation.payment({
            destination: `${process.env.REACT_APP_STELLAR_EXCHANGE_ACCOUNT}`,
            asset: targetAsset,
            amount: new BigNumber(amount)
              .times(price)
              .times(exchangeFeeRate)
              .dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN)
              .toString(),
          }),
        )
        .setTimeout(stellarTxTimeout)
        .build();
    }

    return new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageBuyOffer({
          buying: baseAsset,
          selling: targetAsset,
          buyAmount: new BigNumber(amount)
            .times(new BigNumber(1).minus(exchangeFeeRate))
            .dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN)
            .toString(),
          price: new BigNumber(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_UP),
          offerId,
        }),
      )
      .addOperation(
        Operation.payment({
          destination: `${process.env.REACT_APP_STELLAR_EXCHANGE_ACCOUNT}`,
          asset: targetAsset,
          amount: new BigNumber(amount)
            .times(price)
            .times(exchangeFeeRate)
            .dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN)
            .toString(),
        }),
      )
      .setTimeout(stellarTxTimeout)
      .build();
  }

  // without fee
  if (hardwareWalletType === HardwareWalletType.TREZOR || hardwareWalletType === HardwareWalletType.LEDGER) {
    return new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageSellOffer({
          buying: baseAsset,
          selling: targetAsset,
          amount: new BigNumber(amount).times(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN).toString(),
          price: new BigNumber(1).dividedBy(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_UP),
          offerId,
        }),
      )
      .setTimeout(stellarTxTimeout)
      .build();
  }

  return new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase,
  })
    .addOperation(
      Operation.manageBuyOffer({
        buying: baseAsset,
        selling: targetAsset,
        buyAmount: new BigNumber(amount).dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN).toString(),
        price: new BigNumber(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_UP),
        offerId,
      }),
    )
    .setTimeout(stellarTxTimeout)
    .build();
};

export const buildTxCreateSellOffer = async (
  amount: number | string | BigNumber,
  price: number | string | BigNumber,
  baseAsset: Asset,
  targetAsset: Asset,
  sourceAccount: Account,
  hardwareWalletType: HardwareWalletType | null,
  offerId = '0',
  exchangeFeeRate = '0',
): Promise<Transaction> => {
  const fee = (await server.fetchBaseFee()).toString();

  // with fee
  if (new BigNumber(exchangeFeeRate).gt('0')) {
    return new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageSellOffer({
          selling: baseAsset,
          buying: targetAsset,
          amount: new BigNumber(amount)
            .times(new BigNumber(1).minus(exchangeFeeRate))
            .dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN)
            .toString(),
          price: new BigNumber(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN),
          offerId,
        }),
      )
      .addOperation(
        Operation.payment({
          destination: `${process.env.REACT_APP_STELLAR_EXCHANGE_ACCOUNT}`,
          asset: baseAsset,
          amount: new BigNumber(amount).times(exchangeFeeRate).dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN).toString(),
        }),
      )
      .setTimeout(stellarTxTimeout)
      .build();
  }

  // without fee
  return new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase,
  })
    .addOperation(
      Operation.manageSellOffer({
        selling: baseAsset,
        buying: targetAsset,
        amount: new BigNumber(amount).dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN).toString(),
        price: new BigNumber(price).dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN),
        offerId,
      }),
    )
    .setTimeout(stellarTxTimeout)
    .build();
};

const buyOffer = async (
  amount: number | string | BigNumber,
  price: number | string | BigNumber,
  baseAsset: Asset,
  targetAsset: Asset,
  keyPair: Keypair,
  path: string | null,
  hardwareWalletType: HardwareWalletType | null,
  isFreighter: boolean,
  exchangeFeeRate = '0',
) => {
  // TODO: catch exception when account is not active
  const account = await server.loadAccount(keyPair.publicKey());
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  let transaction: Transaction | FeeBumpTransaction = await buildTxCreateBuyOffer(
    amount,
    price,
    baseAsset,
    targetAsset,
    sourceAccount,
    hardwareWalletType,
    offerIdForNewOffer,
    exchangeFeeRate,
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
      throw e.response.data;
      // return JSON.stringify(e);
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
      throw e.response.data;
      // return JSON.stringify(e);
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
    // return JSON.stringify(e.response, null, 2);
  }
};

const sellOffer = async (
  amount: number | string | BigNumber,
  price: number | string | BigNumber,
  baseAsset: Asset,
  targetAsset: Asset,
  keyPair: Keypair,
  path: string | null,
  hardwareWalletType: HardwareWalletType | null,
  isFreighter: boolean,
  exchangeFeeRate = '0',
) => {
  // TODO: catch exception when account is not active
  const account = await server.loadAccount(keyPair.publicKey());
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  let transaction: Transaction | FeeBumpTransaction = await buildTxCreateSellOffer(
    amount,
    price,
    baseAsset,
    targetAsset,
    sourceAccount,
    hardwareWalletType,
    offerIdForNewOffer,
    exchangeFeeRate,
  );

  // sign
  if (hardwareWalletType === HardwareWalletType.TREZOR) {
    const trezorTransaction = transformTrezorTransaction(path || Trezor.defaultStellarPath, transaction);
    const result = await TrezorConnect.stellarSignTransaction(trezorTransaction);
    if (result.success) {
      // convert to base64
      const signature = Buffer.from(result.payload.signature, 'hex').toString('base64');
      transaction.addSignature(keyPair.publicKey(), signature);
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
      throw e.response.data;
      // return JSON.stringify(e);
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
    // return JSON.stringify(e.response, null, 2);
  }
};

export const sendStellarOffer = async (
  behaviour: string,
  amount: number | string | BigNumber,
  price: number | string | BigNumber,
  selectedPair: Pair,
  // hardwareWalletType: HardwareWalletType | null,
  // path: string | null,
  // publicKey: string | null,
  // secret: string | null,
  wallet: WalletData,
  exchangeFeeRate = '0',
  total = '0',
): Promise<any> => {
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

  const keyPair = secret ? Keypair.fromSecret(secret) : publicKey ? Keypair.fromPublicKey(publicKey) : null;

  if (!keyPair) return;

  const tradeByTotal = new BigNumber(total).gt(0);

  const baseAsset = getAsset(selectedPair.base_symbol, selectedPair.base_stellar_issuer, selectedPair.base_type);
  const targetAsset = getAsset(selectedPair.quote_symbol, selectedPair.quote_stellar_issuer, selectedPair.quote_type);

  if (behaviour === Behaviour.BUY) {
    if (tradeByTotal) {
      const revertedPrice = new BigNumber(1).div(price);
      return await sellOffer(
        total,
        revertedPrice,
        targetAsset,
        baseAsset,
        keyPair,
        path,
        hardwareWalletType,
        isFreighter,
        exchangeFeeRate,
      );
    } else {
      return await buyOffer(
        amount,
        price,
        baseAsset,
        targetAsset,
        keyPair,
        path,
        hardwareWalletType,
        isFreighter,
        exchangeFeeRate,
      );
    }
  } else if (behaviour === Behaviour.SELL) {
    if (tradeByTotal) {
      const revertedPrice = new BigNumber(1).div(price);
      return await buyOffer(
        total,
        revertedPrice,
        targetAsset,
        baseAsset,
        keyPair,
        path,
        hardwareWalletType,
        isFreighter,
        exchangeFeeRate,
      );
    } else {
      return await sellOffer(
        amount,
        price,
        baseAsset,
        targetAsset,
        keyPair,
        path,
        hardwareWalletType,
        isFreighter,
        exchangeFeeRate,
      );
    }
  }
};
