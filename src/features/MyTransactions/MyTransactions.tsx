/* eslint-disable react-hooks/exhaustive-deps */
import { Paper, Tab, Tabs } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { detailIconDark, detailIconLight } from 'src/assets/icon';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppSelector } from 'src/store/hooks';
import { RootState } from 'src/store/store';
import { LIMIT_RECORD, ModeDisplay, TABS, TAB_ID } from './Constant';
import styles from './MyTransaction.module.scss';
import { OpenOrder } from './OpenOrder';
import { OrderHistory } from './OrderHistory';
import TradeHistory, { RefObject } from './TradeHistory';

const cx = classnames.bind(styles);

export const getFilterSize = (modeDisplay: ModeDisplay): 'md' | 'lg' => {
  if (modeDisplay === ModeDisplay.user || modeDisplay === ModeDisplay.admin) {
    return 'lg';
  }
  return 'md';
};

const MyTransactions: React.FC = () => {
  // const dispatch = useDispatch();
  const history = useHistory();
  const [currentTabId, setCurrentTabId] = useState(TAB_ID.OPEN_ORDER);

  const totalOpenOrder: number = useSelector((state: RootState) => state.myTransaction.openOrders.metadata.totalItem);
  const theme = useAppSelector((state) => state.theme.themeMode);

  const handleChangeTab = (event: any, newValue: number) => {
    setCurrentTabId(newValue);
  };

  const dialogRef = useRef<RefObject>(null);
  const gotoDetail = () => {
    const prefixUrl = '/user/trade-history/';
    switch (currentTabId) {
      case TAB_ID.OPEN_ORDER:
        history.push(`${prefixUrl}open-orders`);
        break;
      case TAB_ID.ORDER_HISTORY:
        history.push(`${prefixUrl}order-history`);
        break;
      case TAB_ID.TRADE_HISTORY:
        dialogRef.current?.gotoDetail(prefixUrl);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cx('wrap-container')}>
      <Paper square className={cx('border-radius-config')}>
        <Tabs value={currentTabId} onChange={handleChangeTab} classes={{ root: cx('tab'), indicator: cx('indicator') }}>
          {TABS.map((item, idx) => {
            if (item.id !== TAB_ID.OPEN_ORDER) {
              return <Tab key={idx} label={item.label} />;
            } else {
              return <Tab key={idx} label={item.label + '(' + totalOpenOrder + ')'} />;
            }
          })}
        </Tabs>
      </Paper>
      {currentTabId === TAB_ID.OPEN_ORDER && (
        <OpenOrder modeDisplay={ModeDisplay.dashboard} limitRecord={LIMIT_RECORD} />
      )}
      {currentTabId === TAB_ID.ORDER_HISTORY && (
        <OrderHistory modeDisplay={ModeDisplay.dashboard} limitRecord={LIMIT_RECORD} />
      )}
      {currentTabId === TAB_ID.TRADE_HISTORY && (
        <TradeHistory ref={dialogRef} modeDisplay={ModeDisplay.dashboard} limitRecord={LIMIT_RECORD} />
      )}
      <div className={cx('detail-div')} onClick={gotoDetail}>
        <span className={cx('detail-text')}>Details</span>
        <img className={cx('icon-detail')} src={theme === THEME_MODE.DARK ? detailIconDark : detailIconLight} />
      </div>
    </div>
  );
};

export default MyTransactions;
