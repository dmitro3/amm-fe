import { bscIcon, combineOBIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';
import { TradingMethod } from 'src/constants/dashboard';
import { TradingMethodItem } from 'src/interfaces';
import { THEME_MODE } from 'src/interfaces/theme';

export const isCombineOB = (selectedMethods: TradingMethodItem[], network: TradingMethod): boolean => {
  return (
    selectedMethods.filter((e) => e.key === TradingMethod.StellarOrderbook || e.key === TradingMethod.BSCOrderbook)
      .length === 2 && network !== TradingMethod.BSCPool
  );
};

export const getIconPairSelectByNetwork = (
  network: TradingMethod,
  selectedMethods: TradingMethodItem[],
  theme: string,
): string | undefined => {
  if (network !== TradingMethod.BSCPool) {
    if (isCombineOB(selectedMethods, network)) {
      return combineOBIcon;
    }
    if (selectedMethods.find((e) => e.key === TradingMethod.StellarOrderbook)) {
      return theme === THEME_MODE.LIGHT ? StellarOrderBookLightIcon : StellarOrderBookDarkIcon;
    }

    if (selectedMethods.find((e) => e.key === TradingMethod.BSCOrderbook)) {
      return bscIcon;
    }
  } else return bscIcon;
};
