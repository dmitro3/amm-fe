import BigNumber from 'bignumber.js';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { STELLAR_DECIMAL } from 'src/features/OrderForm/constants/order';
import { SORData } from 'src/features/SOR/interfaces';

export const getNeededAmount = (
  balanceStellar: string,
  balanceBsc: string,
  sorData: SORData,
  behaviour: Behaviour,
  price: string,
  option?: string,
  slippageTolerance?: string,
  customSlippageTolerance?: string,
): { stellar: string; bsc: string } => {
  let totalStellarMakerAmount = new BigNumber(sorData.stellarOB.amount || '0');
  let totalBscMakerAmount = new BigNumber(sorData.bscOB.amount || '0')
    .plus(sorData.bscLP.amount || '0')
    .plus(sorData.pancakeswapLP.amount);

  let currentSlippageTolerance = 1;
  if (customSlippageTolerance) {
    currentSlippageTolerance = new BigNumber(customSlippageTolerance).dividedBy(100).toNumber();
  } else if (slippageTolerance) {
    currentSlippageTolerance = new BigNumber(slippageTolerance).dividedBy(100).toNumber();
  }
  if (behaviour === Behaviour.BUY && option === 'Amount') {
    totalStellarMakerAmount = totalStellarMakerAmount
      .times(price)
      .times(new BigNumber(1).plus(currentSlippageTolerance));
    totalBscMakerAmount = totalBscMakerAmount.times(price).times(new BigNumber(1).plus(currentSlippageTolerance));
  } else if (behaviour === Behaviour.SELL && option === 'Total') {
    totalStellarMakerAmount = totalStellarMakerAmount.div(price).div(new BigNumber(1).plus(currentSlippageTolerance));
    totalBscMakerAmount = totalBscMakerAmount.times(price).times(new BigNumber(1).plus(currentSlippageTolerance));
  }

  const neededAmountInStellar = totalStellarMakerAmount.minus(balanceStellar || '0');
  const neededAmountInBsc = totalBscMakerAmount.minus(balanceBsc || '0');

  // console.log('totalStellarMakerAmount', totalStellarMakerAmount.toString());
  // console.log('totalBscMakerAmount', totalBscMakerAmount.toString());

  return {
    stellar: neededAmountInStellar.gt(0)
      ? neededAmountInStellar.dp(STELLAR_DECIMAL, BigNumber.ROUND_UP).toString()
      : '0',
    bsc: neededAmountInBsc.gt(0) ? neededAmountInBsc.dp(STELLAR_DECIMAL, BigNumber.ROUND_UP).toString() : '0',
  };
};
