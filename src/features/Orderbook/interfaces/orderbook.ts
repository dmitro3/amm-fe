import { TradingMethod } from 'src/constants/dashboard';

export interface Orderbook {
  bids: OrderbookRow[];
  asks: OrderbookRow[];
  updated_at?: number;
}

export interface OrderbookRow {
  price: string;
  amount: string;
  method: TradingMethod;
  total?: string;
  percent?: string;
}

export interface OrderbookUpdate {
  side: number;
  price: string;
  amount: string;
}

export interface OrderbookUpdates {
  data: OrderbookUpdate[];
  updated_at: number;
  last_updated_at: number;
}
