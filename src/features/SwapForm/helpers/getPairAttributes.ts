import { Pair } from 'src/features/Pairs/interfaces/pair';

const DEFAULT_PRECISION = 5;
const DEFAULT_DECIMAL = 18;

export const getAmountPrecision = (selectedPair: Pair | undefined): number => {
  if (selectedPair) {
    const precision = parseFloat(selectedPair?.amount_precision);
    return Math.log10(1 / precision);
  }

  return DEFAULT_PRECISION;
};

export const getPricePrecision = (selectedPair: Pair | undefined): number => {
  if (selectedPair) {
    const precision = parseFloat(selectedPair?.price_precision);
    return Math.log10(1 / precision);
  }

  return DEFAULT_PRECISION;
};

export const getDecimal = (selectedPair: Pair | undefined, inputTo: boolean): number => {
  if (selectedPair) {
    return inputTo ? selectedPair.quote_decimal : selectedPair.base_decimal;
  }

  return DEFAULT_DECIMAL;
};

export const getPattern = (selectedPair: Pair | undefined): RegExp => {
  const precision = getAmountPrecision(selectedPair);
  // prettier-ignore
  return new RegExp(`^\\d{0,100}.\\d{0,${precision}}$`);
};
