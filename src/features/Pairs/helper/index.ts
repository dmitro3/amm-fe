import BigNumber from 'bignumber.js';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { PairInfo, PairInfoResponse } from '../interfaces/pair';

export const getValue = (value?: string): number => {
  return ((value !== undefined || value !== 'undefined' || !!value) && new BigNumber(value || '0').toNumber()) || 0;
};

export const convertPairInfo = (item: PairInfoResponse): PairInfo => ({
  method: item.method,
  pair_id: item.pair_id,
  last_price: getValue(item.last_price),
  last_price_changed: getValue(item.last_price_changed),
  last_trading_method: item.last_trading_method,
  price_change: getValue(item.price_change),
  price_change_percent: getValue(item.price_change_percent),
  quote_volume: getValue(item.quote_volume),
  volume: getValue(item.volume),
  price_precision: item.price_precision,
  amount_precision: item.amount_precision,
  traded_method: item.traded_method,
  liquidity: getValue(item.liquidity),
  ask: item.ask,
  bid: item.bid,
  liquidity_change_percent: getValue(item.liquidity_change_percent),
});

export const displayData = (data: number | string | undefined, precision?: string): number | string => {
  if (data === undefined) return '-';

  return fixPrecision(Number(data), precision || '');
};
