import { TradingMethod } from 'src/constants/dashboard';
import { Role } from 'src/features/SOR/constances/role';
import { Source } from 'src/features/SOR/constances/source';
import { TradingMethodItem } from 'src/interfaces';

export const getIncludedSourcesFromSelectedMethod = (
  selectedMethods: TradingMethodItem[],
  role?: Role,
): Array<Source> => {
  const sources: Array<Source> = [];

  for (const selectedMethod of selectedMethods) {
    if (selectedMethod.key === TradingMethod.StellarOrderbook) {
      sources.push(Source.StellarOBSource);
    } else if (selectedMethod.key === TradingMethod.BSCOrderbook) {
      sources.push(Source.BscOBSource);
    } else if (selectedMethod.key === TradingMethod.BSCPool) {
      sources.push(Source.BscLPSourceMultiHop);
      if (role === Role.ADMIN) {
        sources.push(Source.BscLPSourceAdmin);
      } else if (role === Role.RESTRICTED) {
        sources.push(Source.BscLPSourceRestricted);
      } else if (role === Role.UNRESTRICTED) {
        sources.push(Source.BscLPSourceUnrestricted);
      } else {
        sources.push(Source.BscLPSource);
      }
    } else if (selectedMethod.key === TradingMethod.PancakeswapPool) {
      sources.push(Source.PancakeswapLPSource);
    }
  }

  return sources;
};

export default { getIncludedSourcesFromSelectedMethod };
