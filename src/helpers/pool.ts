import moment from 'moment';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { round } from 'src/features/TradingViewChart/helpers';
import { PoolAdd, PoolSwap, PoolVirtualSwap, PoolWithdrawal, SwapPairData } from 'src/interfaces/pool';
import {
  fetchPairSwapsWithInterval,
  fetchPoolAddsWithInterval,
  fetchPoolSwapsWithInterval,
  fetchPoolWithdrawsWithInterval,
  fetchPoolVirtualWithInterval,
} from 'src/services/pool';

export const DAY_IN_MILLISECONDS = 86400000;
export const WEEK_IN_MILLISECONDS = 7 * DAY_IN_MILLISECONDS;
export const MONTH_IN_MILLISECONDS = 30 * DAY_IN_MILLISECONDS;

export function getSeconds(time: number): number {
  return Math.floor(time / 1000);
}

function normalizeSwaps<T extends { timestamp: number }>(rawSwaps: { [key: string]: T[] }): T[] {
  const swaps: T[] = [];
  for (const key in rawSwaps) {
    const [, timestamp] = key.split('_');
    let swap;
    if (rawSwaps[key].length) {
      const data = rawSwaps[key][0];
      swap = { ...data, updatedAt: data.timestamp * 1000 };
    } else {
      swap = swaps[swaps.length - 1];
    }
    swaps.push({ ...swap, timestamp: Number(timestamp) });
  }
  return swaps.slice(1);
}

export const fetchPairSwaps = async (selectedPair: Pair, interval: number): Promise<SwapPairData[]> => {
  const intervalInMilliseconds = interval * 60 * 1000;
  const tokenIn = selectedPair.base_bsc_address.toLowerCase();
  const tokenOut = selectedPair.quote_bsc_address.toLowerCase();

  const currentTime = Date.now();
  const roundedCurrentTime = round(currentTime, intervalInMilliseconds);
  const startTime = roundedCurrentTime - 14 * intervalInMilliseconds;
  const endTime = roundedCurrentTime;

  const rawSwaps = await fetchPairSwapsWithInterval(tokenIn, tokenOut, startTime, endTime, intervalInMilliseconds);
  if (!rawSwaps['metrics_0'].length) {
    rawSwaps['metrics_0'].push({ pairLiquidity: '0', pairSwapVolume: '0', timestamp: 0 });
  }
  return normalizeSwaps(rawSwaps);
};

const getChartTimes = (interval: number, tickCount: number): number[] => {
  const times: number[] = [];

  if (interval === DAY_IN_MILLISECONDS) {
    const currentTime = Date.now();
    const roundedCurrentTime = round(currentTime, interval);
    const startTime = roundedCurrentTime - (tickCount - 1) * interval;
    const endTime = roundedCurrentTime + interval;
    for (let time = startTime; time <= endTime; time += interval) {
      times.push(time);
    }
  }

  if (interval === WEEK_IN_MILLISECONDS) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1, 0, 0, 0);
    const startTime = date.getTime() - (tickCount - 1) * interval;
    const endTime = date.getTime() + interval;
    for (let time = startTime; time <= endTime; time += interval) {
      times.push(time);
    }
  }

  if (interval === MONTH_IN_MILLISECONDS) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    date.setMonth(date.getMonth() - tickCount + 1);
    for (let i = 0; i <= tickCount; i++) {
      times.push(date.getTime());
      date.setMonth(date.getMonth() + 1);
    }
  }
  return times;
};

export const fetchPoolSwaps = async (poolAddress: string, interval: number, tickCount: number): Promise<PoolSwap[]> => {
  const times = getChartTimes(interval, tickCount);
  const rawSwaps = await fetchPoolSwapsWithInterval(poolAddress, times);
  if (!rawSwaps['metrics_0'].length) {
    rawSwaps['metrics_0'].push({
      poolLiquidity: '0',
      poolTotalSwapVolume: '0',
      poolTotalSwapFee: '0',
      poolTotalNetFee: '0',
      timestamp: 0,
      updatedAt: 0,
    });
  }

  return normalizeSwaps(rawSwaps);
};

export const fetchPoolAdds = async (poolAddress: string, interval: number, tickCount: number): Promise<PoolAdd[]> => {
  const times = getChartTimes(interval, tickCount);
  const rawSwaps = await fetchPoolAddsWithInterval(poolAddress, times);
  if (!rawSwaps['metrics_0'].length) {
    rawSwaps['metrics_0'].push({
      poolTotalAddVolume: '0',
      poolLiquidity: '0',
      timestamp: 0,
      updatedAt: 0,
    });
  }

  return normalizeSwaps(rawSwaps);
};

export const fetchPoolWithdrawals = async (
  poolAddress: string,
  interval: number,
  tickCount: number,
): Promise<PoolWithdrawal[]> => {
  const times = getChartTimes(interval, tickCount);
  const rawSwaps = await fetchPoolWithdrawsWithInterval(poolAddress, times);
  if (!rawSwaps['metrics_0'].length) {
    rawSwaps['metrics_0'].push({
      poolTotalWithdrawVolume: '0',
      poolLiquidity: '0',
      timestamp: 0,
      updatedAt: 0,
    });
  }

  return normalizeSwaps(rawSwaps);
};

export const fetchPoolVirtualSwaps = async (
  poolAddress: string,
  interval: number,
  tickCount: number,
): Promise<PoolVirtualSwap[]> => {
  const times = getChartTimes(interval, tickCount);
  const rawSwaps = await fetchPoolVirtualWithInterval(poolAddress, times);
  if (!rawSwaps['metrics_0'].length) {
    rawSwaps['metrics_0'].push({
      poolLiquidity: '0',
      timestamp: 0,
      updatedAt: 0,
    });
  }
  return normalizeSwaps(rawSwaps);
};

export function getTickCount(interval: number): number {
  if (interval === DAY_IN_MILLISECONDS) {
    return 30;
  } else if (interval === WEEK_IN_MILLISECONDS) {
    return 12;
  } else if (interval === MONTH_IN_MILLISECONDS) {
    return 12;
  }
  throw new Error(`Unknown interval ${interval}`);
}

export const formatChartTime = (timestamp: number, interval: number): string => {
  const date = new Date(timestamp);
  let format = 'DD';
  if (interval === DAY_IN_MILLISECONDS) {
    if (date.getDate() === 1) {
      return moment(timestamp).format('MMM');
    } else {
      format = 'DD';
    }
  } else if (interval === 7 * DAY_IN_MILLISECONDS) {
    if (date.getDate() < 7) {
      return moment(timestamp).format('MMM');
    } else {
      format = 'DD';
    }
  } else {
    if (date.getMonth() === 0) {
      format = 'yyyy';
    } else {
      format = 'MMM';
    }
  }
  return moment(timestamp).format(format);
};
