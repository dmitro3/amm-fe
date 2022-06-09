import classnames from 'classnames/bind';
import React from 'react';
import { Link } from 'react-router-dom';
import { ITransactionFormart } from 'src/features/Trasactions/interface/ITransactionFormart';
import styles from 'src/features/Trasactions/style/Transactions.module.scss';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { useAppSelector } from 'src/store/hooks';
import { formatPoolAddress } from '../helpers/transactionHelpers';
const cx = classnames.bind(styles);

interface ITransaction {
  thead?: string[];
  tbody: any;
}

const CTransaction: React.FC<ITransaction> = ({ thead = [], tbody = [] }) => {
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  return (
    <div className={cx('transaction')}>
      <div className={cx('title')}>Transactions</div>
      {!!thead.length && (
        <div className={cx('head')}>
          {thead.map((item: string) => (
            <span key={item + Math.random()}>{item}</span>
          ))}
        </div>
      )}
      <div className={cx('wrapper')}>
        {tbody?.map((item: ITransactionFormart, index: string) => (
          <div className={cx('body')} key={index}>
            <span className={cx('body-name', `${item.name !== '--' ? 'link' : ''}`)}>
              <span
                onClick={() => {
                  if (item.name !== '--') {
                    window.open(`${process.env.REACT_APP_ETHERSCAN}/tx/${item.id.split('-')[0]}`, '_blank');
                  }
                }}
              >
                {item.name}
              </span>
            </span>
            <span className={cx('body-price')}>
              {item.price !== '--' ? fixPrecision(Number(item.price), selectedPair?.price_precision) : item.price}
            </span>
            <span className={cx('body-amount-in')}>
              {item.tokenAmountIn !== '--'
                ? fixPrecision(Number(item.tokenAmountIn), selectedPair?.amount_precision)
                : item.tokenAmountIn}
            </span>
            <span className={cx('body-amount-out')}>
              {item.tokenAmountOut !== '--'
                ? fixPrecision(Number(item.tokenAmountOut), selectedPair?.amount_precision)
                : item.tokenAmountOut}
            </span>
            <span>
              {item.poolAddress && item.poolAddress !== '--' ? (
                <Link className={cx('body-pool-address')} to={`/pools/${item.poolAddress}`} target="_blank">
                  {formatPoolAddress(item.poolAddress)}
                </Link>
              ) : (
                item.poolAddress
              )}
            </span>
            <span className={cx('body-time')}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CTransaction;
