import { TradingMethod } from 'src/constants/dashboard';

export interface Pair {
  pairs_id: number;
  price_precision: string;
  amount_precision: string;
  minimum_amount: string;
  minimum_total: string;
  group_count: number;
  // base coin
  base_name: string;
  base_symbol: string;
  base_stellar_issuer: string;
  base_bsc_address: string;
  base_type: number;
  base_decimal: number;
  base_warp_type_id: number;
  // quote coin
  quote_name: string;
  quote_symbol: string;
  quote_stellar_issuer: string;
  quote_bsc_address: string;
  quote_type: number;
  quote_decimal: number;
  quote_warp_type_id: number;
}

export interface PairInfo {
  method: number;
  pair_id: number;
  price_change_percent: number;
  volume: number;
  quote_volume: number;
  price_change: number;
  last_price: number;
  price_precision: string;
  amount_precision: string;
  last_price_changed: number;
  last_trading_method: TradingMethod;
  traded_method: TradingMethod;
  liquidity?: number;
  liquidity_change_percent?: number;
  ask: { amount: string; price: string };
  bid: { amount: string; price: string };
}

export interface PairInfoResponse {
  method: number;
  pair_id: number;
  price_change_percent: string;
  volume: string;
  quote_volume: string;
  price_change: string;
  last_price: string;
  price_precision: string;
  amount_precision: string;
  last_price_changed: string;
  last_trading_method: TradingMethod;
  traded_method: TradingMethod;
  liquidity?: string;
  ask: { amount: string; price: string };
  bid: { amount: string; price: string };
  liquidity_change_percent?: string;
}
export interface PairFullInfo {
  pair_id: number;
  name: string;
  price_change_percent: number;
  last_price: number;
  last_price_changed: number;
  last_trading_method: TradingMethod;
  volume: number;
  quote_volume: number;
  network: number;
  price_precision: string;
  amount_precision: string;
  price_change: number;
  ask: { amount: string; price: string };
  bid: { amount: string; price: string };
  liquidity_change_percent: number;
}
