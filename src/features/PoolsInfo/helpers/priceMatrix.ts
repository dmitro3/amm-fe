import BigNumber from 'bignumber.js';
import { Token } from 'src/interfaces/pool';
import { setDataPrecision } from './dataFormatter';

export const calculatePriceMatrix = (rowToken: Token, colToken: Token): string => {
  const price = new BigNumber(colToken.balance)
    .div(colToken.denormWeight)
    .div(new BigNumber(rowToken.balance).div(rowToken.denormWeight))
    .toString();

  return setDataPrecision(price, 4);
};
