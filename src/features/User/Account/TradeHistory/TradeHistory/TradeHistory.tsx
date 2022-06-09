/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import classnames from 'classnames/bind';
import React from 'react';
import { ModeDisplay } from 'src/features/MyTransactions/Constant';
import TradeHistory from 'src/features/MyTransactions/TradeHistory';
import { LIMIT_RECORD } from 'src/features/User/Account/TradeHistory/order.constant';
import styles from 'src/features/User/Account/TradeHistory/TradeHistory.module.scss';

const cx = classnames.bind(styles);

const TradeHistoryComponent: React.FC = () => {
  return (
    <div className={cx('orders')}>
      <div>
        <div className={cx('orders-title')}>Trade History</div>
        <div className={cx('orders-body')}>
          <TradeHistory modeDisplay={ModeDisplay.user} limitRecord={LIMIT_RECORD} />
        </div>
      </div>
    </div>
  );
};

export default TradeHistoryComponent;
