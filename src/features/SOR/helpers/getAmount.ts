import BigNumber from 'bignumber.js';
import { Source } from 'src/features/SOR/constances/source';
import { SORData } from 'src/features/SOR/interfaces';

export const getAmount = (sorData: SORData, source: Source, decimal?: string | number | BigNumber): string => {
  let amount = '';

  if (source === Source.StellarOBSource) {
    amount = sorData.stellarOB.amount;
  } else if (source === Source.BscOBSource) {
    amount = sorData.bscOB.amount;
  } else if (
    source === Source.BscLPSource ||
    source === Source.BscLPSourceAdmin ||
    source === Source.BscLPSourceRestricted ||
    source === Source.BscLPSourceUnrestricted
  ) {
    amount = sorData.bscLP.amount;
  }

  if (decimal) {
    amount = new BigNumber(amount).div(new BigNumber(10).pow(decimal)).toString();
  }

  return amount;
};
