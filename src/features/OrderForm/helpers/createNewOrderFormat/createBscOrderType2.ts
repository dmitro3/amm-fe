import { BigNumber } from '@0x/utils';
import { TradingMethod } from 'src/constants/dashboard';
import { EORDER_TYPE, ORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { OrderSide } from 'src/features/Orderbook/constants/orderbook';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { BscOrderWithSignature } from 'src/features/OrderForm/interfaces/bscOrderWithSignature';
import { Pair } from 'src/features/Pairs/interfaces/pair';

interface BscOrderType2 {
  maker_token: string;
  taker_token: string;
  maker_amounts: string;
  taker_amounts: string;
  price: string;
  amount?: string;
  total?: string;
  sender: string;
  maker: string;
  taker: string;
  taker_token_fee_amounts: string;
  fee_recipient: string;
  pool: string;
  expiry: string;
  salt: string;
  type: EORDER_TYPE;
  signature: string;
  pair_id: number;
  side: 1 | 2;
  order_hash: string;
  method: TradingMethod;
}

export const createBscOrderType2 = (
  p: string,
  a: string,
  t: string,
  bscOrderWithSignature: BscOrderWithSignature,
  behaviour: Behaviour,
  selectedPair: Pair,
  method: TradingMethod,
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bscTradingFee: string,
): BscOrderType2 => {
  const limitOrder = bscOrderWithSignature.limitOrder;
  const isUsingTotal = new BigNumber(t).gt('0');
  return {
    maker_token: limitOrder.makerToken,
    taker_token: limitOrder.takerToken,
    maker_amounts: limitOrder.makerAmount.toString(),
    taker_amounts: limitOrder.takerAmount.toString(),
    price: new BigNumber(p).toString(),
    amount: isUsingTotal ? undefined : a,
    total: isUsingTotal ? t : undefined,
    sender: limitOrder.sender,
    maker: limitOrder.maker,
    // fake
    taker: limitOrder.taker,
    taker_token_fee_amounts: limitOrder.takerTokenFeeAmount.toString(),
    // fake
    fee_recipient: limitOrder.feeRecipient,
    // fake
    pool: limitOrder.pool,
    expiry: limitOrder.expiry.toString(),
    salt: limitOrder.salt.toString(),
    type: type === ORDER_TYPE.LIMIT ? EORDER_TYPE.Limit : EORDER_TYPE.Market,
    signature: JSON.stringify(bscOrderWithSignature.signature),
    pair_id: selectedPair.pairs_id,
    side: behaviour === Behaviour.BUY ? OrderSide.buy : OrderSide.sell,
    order_hash: limitOrder.getHash(),
    method: method,
  };
};
