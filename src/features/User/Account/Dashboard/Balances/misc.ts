export interface IBalancesInfo {
  symbol: string;
  type?: string;
  address: string[];
  total: number;
  order: number;
  available: number;
  pool: number;
  value: number;
  urlBsc?: string;
}
export interface IBalanceItem {
  symbol: string;
  value: number;
  address: string;
  type: string;
}

export type KeySortBalancesInfo = 'total' | 'available' | 'order' | 'pool' | 'value';

export const balancesAddressLowerCase = (arr: string[]): string[] =>
  Array.from(new Set(arr.map((item) => item.toLowerCase())));

export const DEFAULT_PAGE = {
  limit: 10,
  page: 1,
  totalPage: 1,
};
export enum OrderBy {
  Asc = 1,
  Desc = -1,
}

export const MAX_SIZE_SHOW_ADDRESS = 2;
export const HIDE_SMALL_BALANCES = 1;
