/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Grid } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning2.svg';
import { CHART_CONTAINER_ID } from 'src/components/Chart/constant';
import { tradingMethodOptions } from 'src/components/Navigation/contants';
import { setSelectedMethods } from 'src/components/Navigation/redux/tradingMethods.slice';
import { routeConstants } from 'src/constants';
import { TradingMethod } from 'src/constants/dashboard';
import eventBus from 'src/event/event-bus';
import MarketTrade from 'src/features/MarketTrade/components/MarketTrade';
import MyTransactions from 'src/features/MyTransactions/MyTransactions';
import Orderbook from 'src/features/Orderbook/components/Orderbook';
import OrderForm from 'src/features/OrderForm/components/OrderForm';
import { fetchFee } from 'src/features/OrderForm/redux/orderForm';
import Pairs from 'src/features/Pairs/components/Pairs';
import { setSelectedPair } from 'src/features/Pairs/redux/pair';
import SwapForm from 'src/features/SwapForm';
import Chart from 'src/features/TradingViewChart/Components/Chart';
import Transaction from 'src/features/Trasactions/components/Transactions';
import { ReadStatus } from 'src/features/User/Account/Management/Notiication/const';
import {
  getListNotificationsSystem,
  hideNotification,
} from 'src/features/User/Account/Management/Notiication/redux/apis';
import { getNetworkOBFromSelectedMethod } from 'src/helpers/getNetworkOB';
import { returnPairParams } from 'src/helpers/pair';
import { sleep } from 'src/helpers/share';
import styles from 'src/pages/Dashboard/Dashboard.module.scss';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const listNotificationsSystem = useAppSelector((state) => state.notification.listNotificationsSystem);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const pairs = useAppSelector((state) => state.pair.pairs);
  const params = useParams<{ pair: string }>();

  const fetchListNotiSystem = async () => {
    await dispatch(getListNotificationsSystem({ page: 1, size: 20, is_read: ReadStatus.Unread }));
  };

  React.useEffect(() => {
    fetchListNotiSystem();
  }, []);

  const isCombineMethod = () => {
    let isLiq = false;
    let isPancakeswapLiq = false;
    let isOB = false;
    selectedMethods?.map((item) => {
      if (item.key === TradingMethod.BSCPool) {
        isLiq = true;
      } else if (item.key === TradingMethod.BSCOrderbook || item.key == TradingMethod.StellarOrderbook) {
        isOB = true;
      } else if (item.key === TradingMethod.PancakeswapPool) {
        isPancakeswapLiq = true;
      }
    });
    return { isLiq: isLiq, isOB: isOB, isPancakeswapLiq: isPancakeswapLiq };
  };

  const hasLpOption = () => {
    return selectedMethods.some(
      (item) => item.key === TradingMethod.BSCPool || item.key == TradingMethod.PancakeswapPool,
    );
  };

  // direct dashboard with selected pair

  // fetch fee
  useEffect(() => {
    dispatch(fetchFee());
  }, []);

  // update fee
  useEffect(() => {
    dispatch(fetchFee());
    eventBus.on(SocketEvent.TradingFeeUpdated, async (): Promise<void> => {
      await sleep(1000);
      dispatch(fetchFee());
    });
  }, []);

  // watch change pair - url
  useEffect(() => {
    if (history.location.pathname === routeConstants.DASHBOARD && pairs && pairs?.length) {
      dispatch(setSelectedPair(pairs[0]));
    }
  }, [history.location.pathname, pairs]);

  useEffect(() => {
    if (pairs && selectedPair?.pairs_id) {
      const pairSelector = pairs?.find(
        (i) => `${i.base_symbol}_${i.quote_symbol}`?.toLowerCase() === params.pair?.toLowerCase(),
      );
      if (!pairSelector && !selectedPair?.pairs_id) {
        history.push(routeConstants.NOT_FOUND);
        return;
      } else if (pairSelector || selectedPair) {
        history.push(`/trade/${returnPairParams(pairSelector ? selectedPair : pairs[0])}`);
      }
    }
  }, [selectedPair?.pairs_id]);

  useEffect(() => {
    if (pairs && pairs?.length) {
      const pairSelector = pairs?.find(
        (i) => `${i.base_symbol}_${i.quote_symbol}`?.toLowerCase() === params.pair?.toLowerCase(),
      );
      if (!pairSelector && !selectedPair?.pairs_id && !(history.location.pathname === routeConstants.DASHBOARD)) {
        history.push(routeConstants.NOT_FOUND);
        return;
      } else if (pairSelector) {
        dispatch(setSelectedPair(pairSelector));
      }
    }
  }, [pairs?.length]);

  return (
    <Grid
      className={cx('text-color', 'dashboard')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        padding: '10px 40px',
        maxWidth: 1440,
      }}
    >
      <Grid container xs={12} md={12} spacing={1} className={cx('layout')} item={true}>
        <div className={cx('warning-container')}>
          {listNotificationsSystem.data &&
            listNotificationsSystem.data.length > 0 &&
            listNotificationsSystem.data.map((noti) => {
              return (
                <div key={noti.id} className={cx('warning')}>
                  <div
                    onClick={() => {
                      const isStellar = noti.message.toLowerCase().includes('stellar');
                      const isBSC = noti.message.toLowerCase().includes('bsc');

                      if (isStellar) {
                        dispatch(setSelectedMethods([tradingMethodOptions[0]]));
                        history.push(routeConstants.DASHBOARD);
                      } else if (isBSC) {
                        dispatch(setSelectedMethods([tradingMethodOptions[1]]));
                        history.push(routeConstants.DASHBOARD);
                      }
                    }}
                  >
                    <WarningIcon />
                    <div>{noti.message}</div>
                  </div>

                  <CloseIcon
                    id="notiCloseIcon"
                    onClick={async () => {
                      await dispatch(
                        hideNotification({
                          id: noti.id,
                        }),
                      );
                      await fetchListNotiSystem();
                    }}
                  />
                </div>
              );
            })}
        </div>
      </Grid>
      <Grid
        container
        xs={12}
        md={12}
        spacing={1}
        className={isCombineMethod().isOB ? cx('layout') : cx('hide-grid')}
        item={true}
      >
        <Pairs network={getNetworkOBFromSelectedMethod(selectedMethods)} />
      </Grid>
      <Grid
        container
        item={true}
        xs={12}
        md={12}
        spacing={1}
        className={isCombineMethod().isOB ? cx('layout') : cx('hide-grid')}
      >
        <React.Fragment>
          <Grid item={true} xs={12} md={7}>
            <Grid item={true} xs={12}>
              <Chart
                containerId={CHART_CONTAINER_ID.StellarChart}
                isOrderbookChart={true}
                display={isCombineMethod().isOB}
              ></Chart>
            </Grid>
          </Grid>
          <Grid item={true} xs={12} md={5} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 300, height: 570, marginLeft: 0 }}>
              <div className={cx('block')} style={{ height: '100%' }}>
                <Orderbook />
              </div>
            </div>
            <div style={{ width: 300, height: 570, marginRight: 0 }}>
              <div className={cx('block')} style={{ height: '100%' }}>
                <div style={{ padding: '12px', marginTop: '10px' }}> Market Trade</div>
                <MarketTrade />
              </div>
            </div>
          </Grid>
        </React.Fragment>
      </Grid>
      <Grid
        container
        xs={12}
        md={12}
        spacing={1}
        className={isCombineMethod().isLiq || isCombineMethod().isPancakeswapLiq ? cx('layout') : cx('hide-grid')}
        item={true}
      >
        <Pairs network={TradingMethod.BSCPool} />
      </Grid>
      <Grid
        container
        item={true}
        xs={12}
        md={12}
        spacing={1}
        className={isCombineMethod().isLiq ? cx('layout') : cx('hide-grid')}
      >
        <React.Fragment>
          <Grid item={true} xs={12} md={7}>
            <Grid item={true} xs={12} style={{ paddingTop: '16px' }}>
              <Chart
                containerId={CHART_CONTAINER_ID.EvrynetPool}
                isOrderbookChart={false}
                display={isCombineMethod().isLiq}
              ></Chart>
            </Grid>
          </Grid>

          <Grid
            item={true}
            xs={12}
            md={5}
            style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px' }}
          >
            {' '}
            <div style={{ width: 650, marginLeft: 0 }}>
              <div className={cx('block')} style={{ height: '100%' }}>
                <Transaction />
              </div>
            </div>
          </Grid>
        </React.Fragment>
      </Grid>

      <Grid
        container
        item={true}
        xs={12}
        md={12}
        spacing={1}
        className={cx('layout')}
        // style={{ margin: '20px 0' }}
      >
        <React.Fragment>
          <Grid item={true} xs={12} md={7}>
            <div className={cx('block-my-transaction')}>
              <MyTransactions />
            </div>
          </Grid>

          <Grid item={true} xs={12} md={5}>
            <div className={cx('block')}>{hasLpOption() ? <SwapForm /> : <OrderForm />}</div>
            {/* <div className={cx('block')}>Create Order</div> */}
          </Grid>
        </React.Fragment>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
