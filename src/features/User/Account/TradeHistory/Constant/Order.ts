import { TradingMethod } from 'src/constants/dashboard';
import {
  bscIcon,
  coinUSDT,
  coinvCHF,
  coinvEUR,
  coinvTHB,
  coinvUSD,
  StellarOrderBookDarkIcon,
  StellarOrderBookLightIcon,
} from 'src/assets/icon';

// export type TFilter = {
//   pair?: number;
//   method?: number[];
//   type?: number;
//   tradeMethodTab?: number[];
//   status?: number;
//   page: number;
//   limit: number;
// };
export const TRASACTION_TYPE = [
  { value: 1, label: 'Swap' },
  { value: 2, label: 'Add' },
  { value: 3, label: 'Remove' },
];

export interface IOrder {
  id: number;
  checked?: boolean;
  address: string;
  created_at: Date;
  user_id: number;
  user_email: string;
  user_type: number;
  status: number;
  amount: string;
  average: boolean;
  base_name: string;
  filled_amount: string;
  maker_amounts: string;
  method: number;
  pair_id: number;
  pool: string;
  price: string;
  quote_name: string;
  side: number;
  stellar_id: string;
  taker_amounts: string;
  type: number;
}
export interface IFilter {
  pair?: number;
  method?: number[];
  type?: number;
  tradeMethodTab?: number[];
  status?: number[];
  page: number;
  limit: number;
}
export const buy_side = 1;
export const Market = 2;
export const STATUS = {
  fullfill: 'Fullfill',
};
export interface PopUpStatus {
  status: boolean;
  id?: number;
}
export const TAB_LABEL = {
  OPEN_ORDER: 'Open Orders',
  ORDER_HISTORY: 'Order History',
  TRADE_HISTORY: 'Trade History',
};

export enum TAB_ID {
  OPEN_ORDER,
  ORDER_HISTORY,
  TRADE_HISTORY,
}

export const TABS = [
  { id: TAB_ID.OPEN_ORDER, label: TAB_LABEL.OPEN_ORDER },
  { id: TAB_ID.ORDER_HISTORY, label: TAB_LABEL.ORDER_HISTORY },
  { id: TAB_ID.TRADE_HISTORY, label: TAB_LABEL.TRADE_HISTORY },
];

export const PAIR_OPTION = [
  { value: 'pair 1', label: 'pair 1' },
  { value: 'pair 2', label: 'pair 2' },
  { value: 'pair 3', label: 'pair 3' },
  { value: 'pair 4', label: 'pair 4' },
];

export const METHOD_FILTER = [
  {
    value: TradingMethod.StellarOrderbook,
    label: 'Stellar Order Book (OB)',
    darkIcon: StellarOrderBookDarkIcon,
    lightIcon: StellarOrderBookLightIcon,
    symbol: 'OB',
  },
  {
    value: TradingMethod.BSCOrderbook,
    label: 'Evry Order Book',
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    symbol: 'OB',
  },
  {
    value: TradingMethod.BSCPool,
    label: 'Evry Liquidity Pool',
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    symbol: 'LP',
  },
];

export const TYPE_FILTER = [
  { value: 0, label: 'Market' },
  { value: 1, label: 'Limit' },
];

export type TOrder = {
  id: number;
  maker_token: string;
  taker_token: string;
  maker_amounts: number;
  taker_amounts: number;
  sender: string;
  maker: number;
  taker: string;
  taker_token_fee_amounts: number;
  fee_recipient: number;
  pool: string;
  expiry: Date;
  salt: string;
  type: number;
  user_id: number;
  signature: JSON;
  filled_amount: number;
  status: number;
  pair_id: number;
  price: number;
  side: number;
  address: string;
  created_at: Date;
  updated_at: Date;
};

export type TTrade = {
  trade_id: number;
  pair_id: number;
  price: number;
  filled: number;
  sell_fee: number;
  buy_fee: number;
  buy_address: string;
  sell_address: string;
  network: number;
  updated_at: Date;
  sell_amount: number;
  buy_amount: number;
  quote_name: string;
  base_name: string;
};

export type TPair = {
  pair_id: number;
  quote_name: string;
  base_name: string;
};

export type TWallet = {
  wallet_id: number;
  wallet_address: string;
};

export type TFilter = {
  pair?: number;
  method?: number[];
  wallet?: number;
  type?: number;
  orderId?: string;
  tradeMethodTab?: number[];
  status?: number[];
  coinId?: number;
  pool?: string;
  page?: number;
  limit?: number;
  transactionType?: string;
};

export type TTokenLiq = {
  id: string;
  addAddress: { id: string };
  tokenAmountIn?: string;
  tokenIn?: string;
  tokenInSym?: string;
  tokenAmountOut?: string;
  tokenOut?: string;
  tokenOutSym?: string;
};

export const COIN = [
  { symbol: 'USDT', icon: coinUSDT },
  { symbol: 'vEUR', icon: coinvEUR },
  { symbol: 'vUSD', icon: coinvUSD },
  { symbol: 'vTHB', icon: coinvTHB },
  { symbol: 'vCHF', icon: coinvCHF },
];

export enum EORDER_TYPE {
  Market = 2,
  Limit = 1,
}

export const ORDER_TYPE = {
  MARKET: 'Market',
  LIMIT: 'Limit',
};

export enum EORDER_SIDE {
  Buy = 1,
  Sell = 2,
}

export const ORDER_SIDE = {
  BUY: 'Buy',
  SELL: 'Sell',
};

export enum OrderStatus {
  Pending = 0, // Pending order waiting for lock balance
  Canceled = -1, // Cancel order
  Fillable = 1, // Order waiting for exchange
  Filling = 2, // Order in exchange processing with another order
  Fulfill = 3, // Order is done}
}

export const ORDER_STATUS = {
  FILLED: 'Filled',
  PARTIALLY: 'Filled partially',
  CANCELED: 'Canceled',
};

export const FORMAT_DATE = 'DD-MM HH:mm:ss';

export const LIMIT_RECORD = 8;

export const DELAY_TIME = 1000;
