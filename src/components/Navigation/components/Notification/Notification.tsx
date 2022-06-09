import React from 'react';
import {
  setAssetsForTrustline,
  setFreighterAddressForTrustline,
  setLedgerAddressForTrustline,
  setOpenConnectDialog,
  setOpenTrustlineAndSubmitDialog,
  setPrivateKeyOfAddressForTrustline,
  setTrezorAddressForTrustline,
} from 'src/features/ConnectWallet/redux/wallet';
import { getAllAssetsFromCoins } from 'src/helpers/getAllAssetsFromCoins';
import styles from './Notification.module.scss';
import InfiniteScroll from 'react-infinite-scroll-component';
import classnames from 'classnames/bind';
import { THEME_MODE } from 'src/interfaces/theme';
import { Popover, Paper } from '@material-ui/core';
import UnreadNotiLightIcon from 'src/assets/icon/unread-noti-light.svg';
import UnreadNotiDarkIcon from 'src/assets/icon/unread-noti-dark.svg';
import { Link } from 'react-router-dom';
import dot_light from 'src/assets/icon/dot-light.svg';
import dot_dark from 'src/assets/icon/dot-dark.svg';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  readNotification,
  readAllNotifications,
  countNotificationNotRead,
} from 'src/features/User/Account/Management/Notiication/redux/apis';
import { useHistory } from 'react-router';
import { Tooltip } from '@material-ui/core';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { NotificationType } from 'src/features/User/Account/Management/Notiication/const';
import { setSelectedMethods } from 'src/components/Navigation/redux/tradingMethods.slice';
import { tradingMethodOptions } from 'src/components/Navigation/contants';
import { routeConstants } from 'src/constants';
import { INotification } from 'src/features/User/Account/Management/Notiication/interfaces';
import { isShowTradingChart } from 'src/features/TradingViewChart/Components/redux/ChartRedux.slide';

const cx = classnames.bind(styles);

interface NotificationProps {
  notifications: Array<INotification>;
  initFetchListNotiPopup: () => void;
  fetchListNotiPopup: () => void;
  hasMore: boolean;
  open: boolean;
  refElm: HTMLButtonElement | null;
  handleClose: any;
  theme: THEME_MODE;
}

enum IS_READ {
  notRead = 0,
  read = 1,
}

const Notification: React.FC<NotificationProps> = ({
  notifications,
  initFetchListNotiPopup,
  fetchListNotiPopup,
  hasMore,
  theme,
  open,
  refElm,
  handleClose,
}: NotificationProps) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const countNotRead = useAppSelector((state) => state.notification.countNotRead);
  const wallet = useAppSelector((state) => state.wallet);

  const convertTime = (time: string) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
  };

  const seeNotificationDetail = async (noti: INotification) => {
    handleClose(null);

    await dispatch(
      readNotification({
        ids: [noti.id],
      }),
    );

    Promise.allSettled([dispatch(countNotificationNotRead()), initFetchListNotiPopup()]);

    switch (noti.type) {
      case NotificationType.PoolRequest:
        const poolRequestID = noti.data ? Number(JSON.parse(noti.data).poolId) : null;
        history.push(`/user/account/notification/${noti.id}?poolId=${poolRequestID}`);
        break;
      case NotificationType.PoolSwapFee:
        history.push(`/pools/${noti.data ? JSON.parse(noti.data).poolId : null}`);
        break;
      case NotificationType.Wallet:
      case NotificationType.Confidence:
        history.push(`/user/account/setting`);
        break;
      case NotificationType.OrderBookTradingFee:
        const isStellar = noti.message.toLowerCase().includes('stellar');
        const isBSC = noti.message.toLowerCase().includes('bsc');
        dispatch(isShowTradingChart(true));

        if (isStellar) {
          dispatch(setSelectedMethods([tradingMethodOptions[0]]));
          history.push(routeConstants.DASHBOARD);
        } else if (isBSC) {
          dispatch(setSelectedMethods([tradingMethodOptions[1]]));
          history.push(routeConstants.DASHBOARD);
        }
        break;
      case NotificationType.Coin:
        const assets = getAllAssetsFromCoins(JSON.parse(noti.data));
        let isConnected = false;

        if (wallet.freighter) {
          dispatch(setFreighterAddressForTrustline(wallet.freighter));
          isConnected = true;
        } else if (wallet.trezor.publicKey) {
          dispatch(setTrezorAddressForTrustline(wallet.trezor));
          isConnected = true;
        } else if (wallet.ledger.publicKey) {
          dispatch(setLedgerAddressForTrustline(wallet.ledger));
          isConnected = true;
        } else if (wallet.privateKey) {
          dispatch(setPrivateKeyOfAddressForTrustline(wallet.privateKey));
          isConnected = true;
        }

        if (isConnected) {
          dispatch(setAssetsForTrustline(assets));
          dispatch(setOpenTrustlineAndSubmitDialog(true));
        } else {
          dispatch(setOpenConnectDialog(true));
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = async () => {
    handleClose(null);
    await dispatch(readAllNotifications());
    Promise.allSettled([dispatch(countNotificationNotRead()), initFetchListNotiPopup()]);
    dispatch(
      openSnackbar({
        message: 'Mark all as read',
        variant: SnackbarVariant.SUCCESS,
      }),
    );
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={refElm}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{ paper: cx('notification-dropdown') }}
      >
        <Paper>
          <div className={cx('header')}>
            <div className={cx('unread-noti-wrapper')}>
              <div>
                <span className={cx('unread-number')}>{countNotRead}</span>{' '}
                <span className={cx('text')}>pending notifications</span>
              </div>
              <div className={cx('unread-noti-img')}>
                <Tooltip title={<div style={{ padding: 10 }}>Mark all as read</div>}>
                  <img
                    src={theme === THEME_MODE.LIGHT ? UnreadNotiLightIcon : UnreadNotiDarkIcon}
                    onClick={handleMarkAllRead}
                  />
                </Tooltip>
              </div>
            </div>
            <Link
              to="/user/account/notification"
              className={cx('view-all')}
              onClick={() => {
                handleClose(null);
              }}
            >
              View all
            </Link>
          </div>
          {countNotRead ? (
            <div id="notificationsScrollable" className={cx('notifications')}>
              <InfiniteScroll
                next={fetchListNotiPopup}
                hasMore={hasMore}
                dataLength={notifications.length}
                scrollableTarget="notificationsScrollable"
                loader={
                  <div className={cx('noti-wrapper')}>
                    <div className={cx('content-wrapper')}>
                      <div className={cx('content')}>Loading...</div>
                    </div>
                  </div>
                }
              >
                {notifications?.length > 0 &&
                  notifications?.map((noti, index) => (
                    <div className={cx('noti-wrapper')} key={index} onClick={() => seeNotificationDetail(noti)}>
                      <div className={cx('content-wrapper')}>
                        <div className={cx('icon-wrapper')}>
                          {noti.is_read === IS_READ.notRead ? <img src={dot_light}></img> : <img src={dot_dark}></img>}
                        </div>
                        <div className={cx('content')}>{noti.message}</div>
                      </div>
                      <div className={cx('date')}>{convertTime(noti.created_at)}</div>
                    </div>
                  ))}
              </InfiniteScroll>
            </div>
          ) : (
            <div />
          )}
        </Paper>
      </Popover>
    </>
  );
};

export default Notification;
