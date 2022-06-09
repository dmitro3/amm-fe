import React, { useEffect, useState } from 'react';
import { clearSorData } from 'src/features/SOR/redux/sor';
import { useAppDispatch } from 'src/store/hooks';
import LimitOrder from './LimitOrder';
import MarketOrder from 'src/features/OrderForm/components/MarketOrder';
import styles from 'src/features/OrderForm/styles/OrderForm.module.scss';
import classnames from 'classnames/bind';
import { TradingOBType } from 'src/features/OrderForm/constants/type';

const cx = classnames.bind(styles);

const OrderForm: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<TradingOBType>(TradingOBType.Market);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearSorData());
  }, [selectedTab]);

  return (
    <>
      <div className={cx('group-tab')}>
        <div
          className={cx('tab', selectedTab === TradingOBType.Market && 'active')}
          onClick={() => {
            setSelectedTab(TradingOBType.Market);
          }}
        >
          Market
        </div>
        <div
          className={cx('tab', selectedTab === TradingOBType.Limit && 'active')}
          onClick={() => {
            setSelectedTab(TradingOBType.Limit);
          }}
        >
          Limit
        </div>
      </div>

      {selectedTab === TradingOBType.Market && <MarketOrder />}
      {selectedTab === TradingOBType.Limit && <LimitOrder />}
    </>
  );
};

export default OrderForm;
