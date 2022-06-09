export {};

export interface IOrdersInBalances {
  address: string;
  amount: string | number;
  average: unknown;
  base_name: string;
  created_at: string;
  filled_amount: string | number;
  id: number;
  maker_amounts: any;
  method: number;
  pair_id: number;
  pool: any;
  price: number | string;
  quote_name: string;
  side: number;
  status: number;
  stellar_id: string | number;
  taker_amounts: any;
  type: number;
  user_id: number;
}
export interface BalancesInOrderRes {
  value: number;
  symbol: string;
  address: string;
}

export interface ObjectAny {
  [key: string]: any;
}

export enum OrderSide {
  Buy = 1,
  Sell = 2,
}
export interface SeriesChartBalances {
  value: number;
  symbol: string;
}
export interface IListBalancesInfo {
  amount: number;
  symbol: string;
  address: string;
  type: string;
}

export interface BalancesPools {
  digitalCredits: string;
  myAssetValue: string;
  myBalance: string;
  // [key: string]: string;
}

export type TypeFilterBalances = 'all' | 'available' | 'pool' | 'order' | 'lp_token';
export enum EnumFilterType {
  All = 'all',
  Available = 'available',
  Pool = 'pool',
  Order = 'order',
  LpToken = 'lp_token',
}
export enum EnumFilterWallet {
  All = 'all',
}

export const renderWallet = (string: string): string => string.slice(0, 5) + '...' + string.slice(-5);

// pnl
export interface ISelectedDate {
  from: number;
  to: number;
}
export interface IPnlResponse {
  balance: string;
  created_at: string;
  date: string;
  rate: string;
  symbol: string;
  trade_amount: string;
  transfer_amount: string;
  updated_at: string;
  user_id: number;
  wallet: string;
}
export interface IPnlsLiquidityResponse {
  balance: string;
  created_at: string;
  date: string;
  pool_id: string;
  price: string;
  symbol: string;
  transfer_amount: string;
  updated_at: string;
  user_id: number;
  wallet: string;
}

export interface IPnlsReduceAmount {
  date: string;
  wallet: string;

  balance_value: number;
  trade_value: number;
  transfer_value: number;
}
export interface IPnl {
  date: string;
  balance_value: number; // balance of token * rate
  trade_value: number; // trade_amount of token * rate
  transfer_value: number; // transfer_amount of token * rate
  // transfer_value_average: number; // transfer_amount of token * rate

  // pnlCommulativePersent: number;
  pnlDaily: number;
  pnlCommulativeAmount: number;
  // totalTranferAmountToDay: number;
}

export interface IPnlConstant {
  yesterday: number;
  rateChangePnlYesterday: number;
  thirtyDaysAgo: number;
  rateChangePnl30DayAgo: number;
}
