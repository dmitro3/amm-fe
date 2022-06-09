/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import classnames from 'classnames/bind';
import React from 'react';
import { ModeDisplay } from 'src/features/MyTransactions/Constant';
import { OrderHistory as OrderHistoryComponent } from 'src/features/MyTransactions/OrderHistory';
import { LIMIT_RECORD } from 'src/features/User/Account/TradeHistory/order.constant';
import styles from 'src/features/User/Account/TradeHistory/TradeHistory.module.scss';
const cx = classnames.bind(styles);

const OrderHistory: React.FC = () => {
  return (
    <div className={cx('orders')}>
      <div>
        <div className={cx('orders-title')}>Order History</div>
        <div className={cx('orders-body')}>
          <OrderHistoryComponent modeDisplay={ModeDisplay.user} limitRecord={LIMIT_RECORD} />
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
