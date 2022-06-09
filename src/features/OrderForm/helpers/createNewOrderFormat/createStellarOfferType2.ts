import { BigNumber } from '@0x/utils';
import axios from 'axios';
import { TradingMethod } from 'src/constants/dashboard';
import { EORDER_TYPE, ORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { OrderSide } from 'src/features/Orderbook/constants/orderbook';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { STELLAR_DECIMAL } from 'src/features/OrderForm/constants/order';
import { Pair } from 'src/features/Pairs/interfaces/pair';

interface StellarOrderType2 {
  price: string;
  amount?: string;
  total?: string;
  taker_token_fee_amounts: string;
  type: EORDER_TYPE;
  pair_id: number;
  side: 1 | 2;
  method: TradingMethod;
  stellar_id: string | undefined;
  order_hash: string;
  maker: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getStellarOfferId = async (responseData: any): Promise<string | undefined> => {
  if (responseData.offerResults[0]?.currentOffer) {
    return responseData.offerResults[0].currentOffer.offerId;
  } else if (responseData.offerResults[0].offersClaimed.length) {
    const offerClaimedId = responseData.offerResults[0].offersClaimed[0].offerId;
    return await axios
      // TODO: get next data if not found trade
      .get(`${process.env.REACT_APP_HORIZON}trades?offer_id=${offerClaimedId}&limit=200`)
      .then((res) => {
        const record = res.data._embedded.records.find((d: any) => {
          return (
            d.ledger_close_time === responseData.created_at &&
            (d.counter_offer_id === offerClaimedId || d.base_offer_id === offerClaimedId)
          );
        });
        // if (record.offer_id === record.base_offer_id) {
        if (offerClaimedId === record.base_offer_id) {
          return record.counter_offer_id;
          // } else if (record.offer_id === record.counter_offer_id) {
        } else if (offerClaimedId === record.counter_offer_id) {
          return record.base_offer_id;
        } else {
          return undefined;
        }
      })
      .catch((e) => e);
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isFullyMatch = async (responseData: any): Promise<boolean> => {
  return !!(!responseData.offerResults[0]?.currentOffer && responseData.offerResults[0].offersClaimed.length);
};

export const createStellarOfferType2 = (
  a: string | BigNumber,
  p: string | BigNumber,
  t: string | BigNumber,
  behaviour: string,
  selectedPair: Pair,
  method: TradingMethod,
  type: string,
  stellarTradingFee: string,
  orderHash: string,
  maker: string,
  stellarOfferId?: string,
): StellarOrderType2 => {
  let feeAmount: BigNumber;
  const isUsingTotal = new BigNumber(t || '0').gt('0');
  if (behaviour === Behaviour.BUY) {
    if (isUsingTotal) {
      feeAmount = new BigNumber(t).times(stellarTradingFee);
    } else {
      feeAmount = new BigNumber(a).times(p).times(stellarTradingFee);
    }
  } else {
    if (isUsingTotal) {
      feeAmount = new BigNumber(t).div(p).times(stellarTradingFee);
    } else {
      feeAmount = new BigNumber(a).times(stellarTradingFee);
    }
  }
  return {
    price: new BigNumber(p).toString(),
    amount: isUsingTotal ? undefined : a.toString(),
    total: isUsingTotal ? t.toString() : undefined,
    // we use this field to save fee of both buy and sell order
    taker_token_fee_amounts: feeAmount.dp(STELLAR_DECIMAL, BigNumber.ROUND_DOWN).toString(),
    type: type === ORDER_TYPE.LIMIT ? EORDER_TYPE.Limit : EORDER_TYPE.Market,
    pair_id: selectedPair.pairs_id,
    side: behaviour === Behaviour.BUY ? OrderSide.buy : OrderSide.sell,
    method: method,
    stellar_id: stellarOfferId,
    order_hash: orderHash,
    maker,
  };
};
