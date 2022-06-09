import { BigNumber } from 'bignumber.js';

export const validInputNumber = (value: string, numDecimal?: number): string => {
  value = value.toString();
  if (value && value.includes('.')) {
    return value.split('.')[0] + '.' + value.split('.')[1].slice(0, numDecimal || 18);
  }
  return value.toString();
};

export const isDigitalCreditSelected = (tokenAddress: string): boolean => {
  return tokenAddress.substring(0, 2) === '0x';
};

export const bnum = (val: string | number | BigNumber | undefined): BigNumber => {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new BigNumber(number);
};
