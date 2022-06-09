import { RootState } from 'src/store/store';
import { TradingMethod } from 'src/constants/dashboard';
import { Trade } from 'src/features/MarketTrade/interfaces/Trade';
import { MARKET_TRADE_DATA_LENGTH } from 'src/features/MarketTrade/constants/MarketTradeData';

export const tradesSelector = (state: RootState): Trade[] => {
  const selectedMethods = state.trading.selectedMethods;
  const usingStellar = selectedMethods.some((method) => method.key === TradingMethod.StellarOrderbook);
  const usingBsc = selectedMethods.some((method) => method.key === TradingMethod.BSCOrderbook);
  if (usingStellar && usingBsc) {
    return state.marketTrade.combined;
  } else if (usingStellar) {
    return state.marketTrade.stellar;
  } else if (usingBsc) {
    return state.marketTrade.bsc;
  } else {
    return [];
  }
};

export const combineTrades = (stellarTrades: Trade[], bscTrades: Trade[]): Trade[] => {
  return stellarTrades
    .concat(bscTrades)
    .sort((t1, t2) => {
      if (t1.created_at < t2.created_at) return 1;
      if (t1.created_at > t2.created_at) return -1;
      return 0;
    })
    .slice(0, MARKET_TRADE_DATA_LENGTH);
};
