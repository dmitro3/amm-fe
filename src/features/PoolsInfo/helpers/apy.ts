import BigNumber from 'bignumber.js';

const calcInterestRate = (fee24h: string, liquidity: string) => {
  return liquidity == '0' ? '0' : new BigNumber(fee24h).div(liquidity);
};

export const calcAPY = (fee24h: string, liquidity: string): BigNumber => {
  return new BigNumber(1).plus(calcInterestRate(fee24h, liquidity)).pow(365).minus(1).times(100);
};
