import BigNumber from 'bignumber.js';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { fixPrecision } from 'src/helpers/fixPrecision';
import moment from 'moment';
import { ITransaction, ITransactionFormart } from 'src/features/Trasactions/interface/ITransactionFormart';
import { LENGTH_TRANSACTION } from 'src/features/Trasactions/constants/displayMode';

export const formatPoolAddress = (poolAddress: string): string => {
  return poolAddress.slice(0, 4) + '...' + poolAddress.slice(-4);
};
const setLengthTransaction = (transaction: ITransactionFormart[]): ITransactionFormart[] => {
  while (transaction.length < LENGTH_TRANSACTION) {
    transaction.push({
      id: '--',
      name: '--',
      price: '--',
      tokenAmountIn: '--',
      tokenAmountOut: '--',
      poolAddress: '--',
      time: '--',
    });
  }
  return transaction;
};
export const formatTransaction = (Transaction: ITransaction[], selectedPair: Pair): ITransactionFormart[] => {
  const formatTransaction = Transaction?.map((record: ITransaction): ITransactionFormart => {
    let tokenAmountIn;
    let tokenAmountOut;
    if (record.tokenInSym === selectedPair.quote_symbol) {
      tokenAmountIn = record.tokenAmountOut;
      tokenAmountOut = record.tokenAmountIn;
    } else {
      tokenAmountIn = record.tokenAmountIn;
      tokenAmountOut = record.tokenAmountOut;
    }
    const price = new BigNumber(tokenAmountOut).dividedBy(new BigNumber(tokenAmountIn)).toString();
    return {
      id: record.id,
      name: `Swap ${record.tokenInSym} for ${record.tokenOutSym}`,
      price: fixPrecision(Number(price), selectedPair.price_precision),
      tokenAmountIn: fixPrecision(Number(tokenAmountIn), selectedPair.price_precision),
      tokenAmountOut: fixPrecision(Number(tokenAmountOut), selectedPair.price_precision),
      poolAddress: record.poolAddress.id,
      time: moment.unix(record.timestamp).format('HH:mm:ss'),
    };
  });
  return setLengthTransaction(formatTransaction);
};
export default { formatTransaction };
