import React, { useEffect, useState } from 'react';
import CTransaction from 'src/features/Trasactions/components/TransactionTable';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getTransactionsApi, clearTransactions } from 'src/features/Trasactions/redux/transactions.slice';
import { formatTransaction } from 'src/features/Trasactions/helpers/transactionHelpers';
import { ITransactionFormart } from 'src/features/Trasactions/interface/ITransactionFormart';
import { LENGTH_TRANSACTION } from 'src/features/Trasactions/constants/displayMode';

export const Transaction: React.FC = () => {
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const dispatch = useAppDispatch();
  const [formattedTransactions, setFormattedTransaction] = useState<ITransactionFormart[]>([]);
  const getTransaction = async () => {
    const query = `{ \
      swaps(
        orderBy: timestamp, \
        orderDirection: desc, \
        where: { \
          tokenIn_in:["${selectedPair?.quote_bsc_address}","${selectedPair?.base_bsc_address}"],\
          tokenOut_in:["${selectedPair?.base_bsc_address}","${selectedPair?.quote_bsc_address}"]
         }
       ){\
        id
        tokenInSym\
        tokenOutSym\
        tokenAmountIn\
        tokenAmountOut\
        poolAddress {\
                      id\
                      }\
        timestamp\
       }\
      }`;
    await dispatch(getTransactionsApi({ query }));
  };
  useEffect(() => {
    dispatch(clearTransactions());
    getTransaction().then();
  }, [selectedPair]);

  useEffect(() => {
    if (selectedPair) {
      setFormattedTransaction(formatTransaction(transactions, selectedPair));
    }
  }, [transactions, selectedPair]);
  return (
    <CTransaction
      thead={[
        'Swap',
        `Price (${selectedPair?.quote_symbol ? selectedPair?.quote_symbol : '--'})`,
        `Digital credit amount (${selectedPair?.base_symbol ? selectedPair?.base_symbol : '--'})`,
        `Digital credit amount (${selectedPair?.quote_symbol ? selectedPair?.quote_symbol : '--'})`,
        'Pool',
        'Time',
      ]}
      tbody={formattedTransactions.slice(0, LENGTH_TRANSACTION)}
    />
  );
};
export default Transaction;
