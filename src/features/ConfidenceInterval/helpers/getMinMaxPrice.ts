import BigNumber from 'bignumber.js';

export const getMinPrice = (
  price: string | number | BigNumber,
  volatility: string | number | BigNumber,
  internalCalculation: string | number | BigNumber,
  numberOfStd: string | number | BigNumber,
): string => {
  const leftValue = new BigNumber(0).minus(new BigNumber(volatility).pow(2).times(0.5)).times(internalCalculation);
  const rightValue = new BigNumber(numberOfStd).times(volatility).times(new BigNumber(internalCalculation).sqrt());
  return new BigNumber(price).times(new BigNumber(Math.exp(leftValue.minus(rightValue).toNumber()))).toFixed(4);
};

export const getMaxPrice = (
  price: string | number | BigNumber,
  volatility: string | number | BigNumber,
  internalCalculation: string | number | BigNumber,
  numberOfStd: string | number | BigNumber,
): string => {
  const leftValue = new BigNumber(0).minus(new BigNumber(volatility).pow(2).times(0.5)).times(internalCalculation);
  const rightValue = new BigNumber(numberOfStd).times(volatility).times(new BigNumber(internalCalculation).sqrt());
  return new BigNumber(price).times(new BigNumber(Math.exp(leftValue.plus(rightValue).toNumber()))).toFixed(4);
};

export default { getMinPrice, getMaxPrice };
