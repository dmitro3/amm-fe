import { BigNumber } from '@0x/utils';

export const fixPrecision = (number: number | BigNumber, precisionParams: string | undefined): string => {
  const precision = precisionParams?.split('.');
  let value;
  if (precision && precision[1] !== undefined && precision[1]) {
    value = precision[1].length;
    return Number(number).toFixed(value);
  }
  return Number(number).toFixed(0);
};
