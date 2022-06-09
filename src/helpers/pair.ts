import { Pair, PairFullInfo, PairInfo } from 'src/features/Pairs/interfaces/pair';
import { RootState } from 'src/store/store';
import { TradingMethod } from 'src/constants/dashboard';
import { TradingMethodItem } from 'src/interfaces';
import BigNumber from 'bignumber.js';

const getTradingMethodId = (selectedMethods: TradingMethodItem[]): TradingMethod => {
  const usingStellar = selectedMethods.some((method) => method.key === TradingMethod.StellarOrderbook);
  const usingBsc = selectedMethods.some((method) => method.key === TradingMethod.BSCOrderbook);
  if (usingStellar && usingBsc) {
    return TradingMethod.CombinedOrderbook;
  } else if (usingStellar) {
    return TradingMethod.StellarOrderbook;
  } else if (usingBsc) {
    return TradingMethod.BSCOrderbook;
  }
  return TradingMethod.BSCPool;
};

export const getPairFullInfo = (
  pairs: Array<Pair>,
  pairInfos: Array<PairInfo>,
  method: TradingMethod,
): Array<PairFullInfo> => {
  // const method = getTradingMethodId(selectedMethods);
  const cookedData = pairs.map((pair: Pair) => {
    const pairFullInfo = pairInfos.find(
      (pairInfo: PairInfo) => pairInfo.pair_id === pair.pairs_id && pairInfo.method === method,
    );
    return {
      pair_id: pair.pairs_id,
      name: pair.base_symbol + '/' + pair.quote_symbol,
      last_price: pairFullInfo?.last_price || 0,
      last_price_changed: pairFullInfo?.last_price_changed || 0,
      last_trading_method: pairFullInfo?.last_trading_method || 0,
      price_change_percent: pairFullInfo?.price_change_percent || 0,
      quote_volume: pairFullInfo?.quote_volume || 0,
      volume: pairFullInfo?.volume || 0,
      network: method,
      price_precision: pair?.price_precision || '',
      amount_precision: pair?.amount_precision || '',
      price_change: pairFullInfo?.price_change || 0,
      ask: pairFullInfo?.ask || { amount: '', price: '' },
      bid: pairFullInfo?.bid || { amount: '', price: '' },
      liquidity_change_percent: pairFullInfo?.liquidity_change_percent || 0,
    };
  });
  return cookedData;
};

export const selectedPairInfoSelector = (state: RootState): PairInfo | undefined => {
  const selectedPair = state.pair.selectedPair;
  const pairInfos = state.pair.pairInfos;
  const selectedMethods = state.trading.selectedMethods;
  const method = getTradingMethodId(selectedMethods);

  if (selectedPair && pairInfos) {
    return pairInfos.find((pair: PairInfo) => pair.pair_id === selectedPair.pairs_id && pair.method === method);
  }
};

export const returnPairParams = (pair: Pair): string => {
  return `${pair.base_symbol}_${pair.quote_symbol}`;
};

export const returnAmountBidAsk = (amount: number | string, amount_precision?: string): string | number => {
  return Number(amount) > 0
    ? amount
    : '< ' + new BigNumber(10).pow(Math.log10(Number(amount_precision) || 1)).toString();
};
