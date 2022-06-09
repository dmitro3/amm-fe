import classNames from 'classnames/bind';
import React from 'react';
import { ModeDisplay } from 'src/features/MyTransactions/Constant';
import { OpenOrder as OpenOrderComponent } from 'src/features/MyTransactions/OpenOrder';
import { LIMIT_RECORD } from 'src/features/User/Account/TradeHistory/order.constant';
import styles from 'src/features/User/Account/TradeHistory/TradeHistory.module.scss';
const cx = classNames.bind(styles);

const OpenOrders: React.FC = () => {
  return (
    <div className={cx('orders')}>
      <div>
        <div className={cx('orders-title')}>Open Order</div>
        <div className={cx('orders-body')}>
          <OpenOrderComponent modeDisplay={ModeDisplay.user} limitRecord={LIMIT_RECORD} />
        </div>
      </div>
    </div>
  );
};

export default OpenOrders;
