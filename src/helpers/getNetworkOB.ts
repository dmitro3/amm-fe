import { TradingMethod } from 'src/constants/dashboard';
import { TradingMethodItem } from 'src/interfaces';

export const getNetworkOBFromSelectedMethod = (selectedMethods: TradingMethodItem[]): TradingMethod => {
  const usingStellar = selectedMethods.some((method) => method.key === TradingMethod.StellarOrderbook);
  const usingBsc = selectedMethods.some((method) => method.key === TradingMethod.BSCOrderbook);
  if (usingStellar && usingBsc) {
    return TradingMethod.CombinedOrderbook;
  } else if (usingStellar) {
    return TradingMethod.StellarOrderbook;
  } else if (usingBsc) {
    return TradingMethod.BSCOrderbook;
  }
  return TradingMethod.StellarOrderbook;
};
