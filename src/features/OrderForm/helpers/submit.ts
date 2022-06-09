import { BigNumber } from '@0x/utils';
import { ISelect } from 'src/components/Base/Select/Select';
import { TradingMethod } from 'src/constants/dashboard';
import { getCurrentChainId, isCorrectNetworkBsc } from 'src/features/ConnectWallet/helpers/connectWallet';
import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { ORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { BSCError } from 'src/features/OrderForm/constants/error';
import { TimeInForce } from 'src/features/OrderForm/constants/timeInForce';
import { createBscOrderWithSignature } from 'src/features/OrderForm/helpers/createBscOrderWithSignature';
import { createBscOrderType2 } from 'src/features/OrderForm/helpers/createNewOrderFormat/createBscOrderType2';
import {
  createStellarOfferType2,
  getStellarOfferId,
} from 'src/features/OrderForm/helpers/createNewOrderFormat/createStellarOfferType2';
import { sendBscOrderToSmartContract } from 'src/features/OrderForm/helpers/sendBscOrderToSmartContract';
import { sendStellarOffer } from 'src/features/OrderForm/helpers/sendStellarOffer';
import { sendOrder } from 'src/features/OrderForm/services';
import { Pair } from 'src/features/Pairs/interfaces/pair';

interface StellarMarketOfferParam {
  amountTotal: string;
  price: string;
  selectedPair: Pair;
  customSlippageTolerance: string | number | BigNumber;
  slippageTolerance: string | number | BigNumber;
  behaviour: Behaviour;
  stellarTradingFee: string;
  wallet: WalletData;
  option: ISelect;
}

export const submitStellarMarketOffer = async (p: StellarMarketOfferParam): Promise<any> => {
  try {
    if (
      new BigNumber(p.amountTotal).gt(0) &&
      new BigNumber(p.price).gt(0) &&
      p.selectedPair &&
      new BigNumber(p.stellarTradingFee).gte('0')
    ) {
      const currentSlippageTolerance = p.customSlippageTolerance
        ? new BigNumber(p.customSlippageTolerance).dividedBy(100).toNumber()
        : new BigNumber(p.slippageTolerance).dividedBy(100).toNumber();

      let calculatedPrice =
        p.behaviour === Behaviour.BUY
          ? new BigNumber(p.price).plus(new BigNumber(p.price).times(currentSlippageTolerance))
          : new BigNumber(p.price).minus(new BigNumber(p.price).times(currentSlippageTolerance));
      if (calculatedPrice.lte(0)) {
        calculatedPrice = new BigNumber(p.selectedPair.price_precision);
      }

      const enteredAmount = p.option.value === 'Amount';

      const stellarResponseData = await sendStellarOffer(
        p.behaviour,
        enteredAmount ? p.amountTotal : '0',
        calculatedPrice.toFixed(7),
        p.selectedPair,
        p.wallet,
        p.stellarTradingFee,
        enteredAmount ? '0' : p.amountTotal,
      );

      const method = TradingMethod.StellarOrderbook;
      const stellarOfferId = await getStellarOfferId(stellarResponseData);

      const stellarOfferType2 = createStellarOfferType2(
        enteredAmount ? p.amountTotal : '0',
        calculatedPrice,
        enteredAmount ? '0' : p.amountTotal,
        p.behaviour,
        p.selectedPair,
        method,
        ORDER_TYPE.MARKET,
        p.stellarTradingFee,
        stellarResponseData.hash,
        stellarResponseData.source_account,
        stellarOfferId,
      );
      const apiResponseData = await sendOrder(stellarOfferType2);
      return { stellar: stellarResponseData, api: apiResponseData };
    }

    return { stellar: undefined, api: undefined };
  } catch (e) {
    throw e;
  }
};

interface BscMarketOrderParam {
  amountTotal: string;
  price: string;
  selectedPair: Pair;
  customSlippageTolerance: string | number | BigNumber;
  slippageTolerance: string | number | BigNumber;
  behaviour: Behaviour;
  bscTradingFee: string;
  wallet: WalletData;
  option: ISelect;
}

export const submitBscMarketOrder = async (p: BscMarketOrderParam): Promise<any> => {
  if (!isCorrectNetworkBsc(getCurrentChainId())) {
    throw BSCError.WRONG_NETWORK;
  }

  try {
    if (
      new BigNumber(p.amountTotal).gt(0) &&
      new BigNumber(p.price).gt(0) &&
      p.selectedPair &&
      new BigNumber(p.bscTradingFee).gte('0')
    ) {
      const currentSlippageTolerance = p.customSlippageTolerance
        ? new BigNumber(p.customSlippageTolerance).dividedBy(100).toNumber()
        : new BigNumber(p.slippageTolerance).dividedBy(100).toNumber();

      let calculatedPrice =
        p.behaviour === Behaviour.BUY
          ? new BigNumber(p.price).plus(new BigNumber(p.price).times(currentSlippageTolerance))
          : new BigNumber(p.price).minus(new BigNumber(p.price).times(currentSlippageTolerance));
      if (calculatedPrice.lte(0)) {
        calculatedPrice = new BigNumber(p.selectedPair.price_precision);
      }
      const enteredAmount = p.option.value === 'Amount';

      const bscOrderWithSignature = await createBscOrderWithSignature(
        p.behaviour,
        p.selectedPair,
        enteredAmount ? p.amountTotal : '0',
        calculatedPrice,
        enteredAmount ? '0' : p.amountTotal,
        p.bscTradingFee,
        p.wallet.bsc,
        // fake
        TimeInForce.GTC,
      );
      const method = TradingMethod.BSCOrderbook;

      // call API to store order
      const bscOrderType2 = createBscOrderType2(
        calculatedPrice.toString(),
        enteredAmount ? p.amountTotal : '0',
        enteredAmount ? '0' : p.amountTotal,
        bscOrderWithSignature,
        p.behaviour,
        p.selectedPair,
        method,
        ORDER_TYPE.MARKET,
        p.bscTradingFee,
      );
      const responseData = await sendOrder(bscOrderType2);

      // send order to smart contract
      await sendBscOrderToSmartContract(bscOrderWithSignature, p.wallet.bsc);

      return responseData;
    }

    return null;
  } catch (e) {
    throw e;
  }
};

interface StellarLimitOfferParam {
  price: string;
  amount: string;
  selectedPair: Pair;
  behaviour: Behaviour;
  stellarTradingFee: string;
  wallet: WalletData;
}

export const submitStellarLimitOffer = async (p: StellarLimitOfferParam): Promise<any> => {
  try {
    if (
      new BigNumber(p.amount).gt(0) &&
      new BigNumber(p.price).gt(0) &&
      p.selectedPair &&
      new BigNumber(p.stellarTradingFee).gte('0')
    ) {
      const responseData = await sendStellarOffer(
        p.behaviour,
        p.amount,
        p.price,
        p.selectedPair,
        p.wallet,
        p.stellarTradingFee,
      );

      const method = TradingMethod.StellarOrderbook;
      const stellarOfferId = await getStellarOfferId(responseData);

      const stellarOfferType2 = createStellarOfferType2(
        p.amount,
        p.price,
        '0',
        p.behaviour,
        p.selectedPair,
        method,
        ORDER_TYPE.LIMIT,
        p.stellarTradingFee,
        responseData.hash,
        responseData.source_account,
        stellarOfferId,
      );
      await sendOrder(stellarOfferType2);
    }
  } catch (e) {
    throw e;
  }
};

interface BscLimitOrderParam {
  price: string;
  amount: string;
  selectedPair: Pair;
  behaviour: Behaviour;
  bscTradingFee: string;
  wallet: WalletData;
  durationOption: ISelect;
}

export const submitBscLimitOrder = async (p: BscLimitOrderParam): Promise<any> => {
  if (!isCorrectNetworkBsc(getCurrentChainId())) {
    throw BSCError.WRONG_NETWORK;
  }

  try {
    if (
      new BigNumber(p.price).gt(0) &&
      new BigNumber(p.amount).gt(0) &&
      p.selectedPair &&
      new BigNumber(p.bscTradingFee).gte('0')
    ) {
      const expiryType = p.durationOption.value;
      const bscOrderWithSignature = await createBscOrderWithSignature(
        p.behaviour,
        p.selectedPair,
        p.amount,
        p.price,
        '0',
        p.bscTradingFee,
        p.wallet.bsc,
        expiryType,
      );
      const method = TradingMethod.BSCOrderbook;
      // call API to store order
      const bscOrderType2 = createBscOrderType2(
        p.price.toString(),
        p.amount.toString(),
        '0',
        bscOrderWithSignature,
        p.behaviour,
        p.selectedPair,
        method,
        ORDER_TYPE.LIMIT,
        p.bscTradingFee,
      );
      await sendOrder(bscOrderType2);

      // send order to smart contract
      await sendBscOrderToSmartContract(bscOrderWithSignature, p.wallet.bsc);
    }
  } catch (e) {
    throw e;
  }
};
