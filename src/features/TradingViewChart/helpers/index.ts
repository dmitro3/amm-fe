import { Timezone } from 'src/charting_library/charting_library.min';
import { Trade } from 'src/features/MarketTrade/interfaces/Trade';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { Candle } from 'src/features/TradingViewChart/interfaces';

export const DEFAULT_TRADING_VIEW_INTERVAL = '1D';

export const getInterval = (interval: string): number => {
  const stringIntervals: { [key: string]: number } = {
    '1D': 24 * 60,
    D: 3 * 24 * 60, // it should be '3D', but there is a bug of TradingView, it call get bars with resolution D
    '3D': 3 * 24 * 60,
    '1W': 7 * 24 * 60,
    '1M': 30 * 24 * 60,
  };
  if (stringIntervals[interval]) {
    return stringIntervals[interval];
  } else {
    return Number(interval);
  }
};

export function getIntervalString(interval: number): string {
  const days = interval / 24 / 60;
  if (days >= 30) return '1M';
  if (days >= 7) return '1W';
  if (days >= 3) return '3D';
  if (days === 1) return '1D';
  return interval.toString();
}

export const round = (n: number, base: number): number => {
  return Math.floor(n / base) * base;
};

export const createEmptyCandleIfNeeded = (
  lastCandle: Candle,
  intervalInMilliseconds: number,
  chartRealtimeCallback: (candle: Candle) => void,
): Candle => {
  const lastCandleEndTime = lastCandle.time + intervalInMilliseconds;
  const tradePrice = lastCandle.close;
  const tradeTime = round(Date.now(), intervalInMilliseconds);
  if (tradeTime >= lastCandleEndTime) {
    const newCandle: Candle = {
      open: tradePrice,
      close: tradePrice,
      high: tradePrice,
      low: tradePrice,
      time: tradeTime,
      volume: 0,
    };
    if (chartRealtimeCallback) {
      chartRealtimeCallback(lastCandle);
    }
    return newCandle;
  }
  return lastCandle;
};

export const addTradeToLastCandle = (
  trade: Trade,
  lastCandle: Candle,
  intervalInMilliseconds: number,
  chartRealtimeCallback: (candle: Candle) => void,
): Candle => {
  const lastCandleEndTime = lastCandle.time + intervalInMilliseconds;
  const tradePrice = Number(trade.price);
  const tradeTime = round(new Date(trade.created_at).getTime(), intervalInMilliseconds);
  if (tradeTime >= lastCandleEndTime) {
    const newCandle: Candle = {
      open: Number(lastCandle.close),
      close: tradePrice,
      high: Math.max(tradePrice, lastCandle.close),
      low: Math.min(tradePrice, lastCandle.close),
      time: tradeTime,
      volume: 0,
    };
    chartRealtimeCallback(lastCandle);
    return newCandle;
  } else {
    lastCandle.low = Math.min(tradePrice, lastCandle.low);
    lastCandle.high = Math.max(tradePrice, lastCandle.high);
    lastCandle.close = Number(trade.price);
    lastCandle.volume += Number(trade.filled_amount);
    lastCandle.time = round(new Date(trade.created_at).getTime(), intervalInMilliseconds);
    chartRealtimeCallback(lastCandle);
    return lastCandle;
  }
};

export function getSymbol(pair?: Pair): string {
  return `${pair?.base_symbol}/${pair?.quote_symbol}`;
}

const timezones: { [key: string]: number } = {};
timezones['America/New_York'] = -5;
timezones['America/Los_Angeles'] = -8;
timezones['America/Chicago'] = -6;
timezones['America/Phoenix'] = -7;
timezones['America/Toronto'] = -5;
timezones['America/Vancouver'] = -8;
timezones['America/Argentina/Buenos_Aires'] = -3;
timezones['America/El_Salvador'] = -6;
timezones['America/Sao_Paulo'] = -3;
timezones['America/Bogota'] = -5;
timezones['America/Caracas'] = -4;
timezones['Europe/Moscow'] = 3;
timezones['Europe/Athens'] = 2;
timezones['Europe/Belgrade'] = 1;
timezones['Europe/Berlin'] = 1;
timezones['Europe/London'] = 0;
timezones['Europe/Luxembourg'] = 1;
timezones['Europe/Madrid'] = 1;
timezones['Europe/Paris'] = 1;
timezones['Europe/Rome'] = 1;
timezones['Europe/Warsaw'] = 1;
timezones['Europe/Istanbul'] = 3;
timezones['Europe/Zurich'] = 1;
timezones['Australia/Sydney'] = 10;
timezones['Australia/Brisbane'] = 10;
timezones['Australia/Adelaide'] = 9.5;
timezones['Australia/ACT'] = 10;
timezones['Asia/Almaty'] = 6;
timezones['Asia/Ashkhabad'] = 5;
timezones['Asia/Tokyo'] = 9;
timezones['Asia/Taipei'] = 8;
timezones['Asia/Singapore'] = 8;
timezones['Asia/Shanghai'] = 8;
timezones['Asia/Seoul'] = 9;
timezones['Asia/Tehran'] = 3.5;
timezones['Asia/Dubai'] = 4;
timezones['Asia/Kolkata'] = 5.5;
timezones['Asia/Hong_Kong'] = 8;
timezones['Asia/Bangkok'] = 7;
timezones['Asia/Chongqing'] = 8;
timezones['Asia/Jerusalem'] = 2;
timezones['Asia/Kuwait'] = 3;
timezones['Asia/Muscat'] = 4;
timezones['Asia/Qatar'] = 3;
timezones['Asia/Riyadh'] = 3;
timezones['Pacific/Auckland'] = 12;
timezones['Pacific/Chatham'] = 12.75;
timezones['Pacific/Fakaofo'] = 13;
timezones['Pacific/Honolulu'] = -10;
timezones['America/Mexico_City'] = -6;
timezones['Africa/Cairo'] = 2;
timezones['Africa/Johannesburg'] = 2;
timezones['Asia/Kathmandu'] = 5.75;
timezones['US/Mountain'] = -7;

export function getClientTimezone(): Timezone {
  const timezone = (new Date().getTimezoneOffset() * -1) / 60;
  for (const key in timezones) {
    if (timezones[key] === timezone) {
      return key as Timezone;
    }
  }
  return 'Etc/UTC';
}

export function getClientTimezoneValue(): number {
  const timezoneKey = getClientTimezone();
  return timezones[timezoneKey];
}
