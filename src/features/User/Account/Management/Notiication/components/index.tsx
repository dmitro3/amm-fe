/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import classnames from 'classnames/bind';
import { useHistory } from 'react-router';
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
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import styles from 'src/features/User/Account/Management/Notiication/styles/notification.module.scss';
import { Pagination } from '@material-ui/lab';
import stylesPagition from 'src/components/Pagination/style';
import dot_light from 'src/assets/icon/dot-light.svg';
import dot_dark from 'src/assets/icon/dot-dark.svg';
import Delete_dark from 'src/assets/icon/Delete-dark.svg';
import list_dark from 'src/assets/icon/list-dark.svg';
import list_light from 'src/assets/icon/list-light.svg';
import { CCheckbox } from 'src/components/Base/Checkbox';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Tooltip } from '@material-ui/core';
import {
  getListNotifications,
  readNotification,
  readAllNotifications,
  deleteAllNotifications,
  countNotificationNotRead,
} from 'src/features/User/Account/Management/Notiication/redux/apis';
import { THEME_MODE } from 'src/interfaces/theme';
import { DEFAULT_PAGINATION, INotification } from 'src/features/User/Account/Management/Notiication/interfaces';
import { NotificationType, ReadStatus } from 'src/features/User/Account/Management/Notiication/const';
import { setSelectedMethods } from 'src/components/Navigation/redux/tradingMethods.slice';
import { tradingMethodOptions } from 'src/components/Navigation/contants';
import { routeConstants } from 'src/constants';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { clearListNotification } from 'src/features/User/Account/Management/Notiication/redux/notification.slice';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { initFetchListNotiPopup } from 'src/components/Navigation/TopNav2';

const cx = classnames.bind(styles);

const AccountNotification: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const classes = stylesPagition();
  const theme = useAppSelector((state) => state.theme.themeMode);
  const listNotifications = useAppSelector((state) => state.notification.listNotifications.data);
  const totalPage = useAppSelector((state) => state.notification.listNotifications.metadata.totalPage);
  const wallet = useAppSelector((state) => state.wallet);

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [clickDeleteAll, setClickDeleteAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRead, setIsRead] = useState<number>();

  useScrollToTop();

  useEffect(() => {
    return () => {
      dispatch(clearListNotification());
    };
  }, []);

  useEffect(() => {
    dispatch(getListNotifications({ size: 10, page: currentPage, is_read: isRead }));
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    dispatch(getListNotifications({ size: 10, page: 1, is_read: isRead }));
  }, [isRead]);

  const handleMarkAllRead = async () => {
    await dispatch(readAllNotifications());
    await dispatch(countNotificationNotRead());
    await dispatch(getListNotifications(DEFAULT_PAGINATION));
    await setCurrentPage(1);
    await setIsRead(undefined);
    dispatch(
      openSnackbar({
        message: 'Mark all as read',
        variant: SnackbarVariant.SUCCESS,
      }),
    );
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number): void => {
    setCurrentPage(value);
  };

  const seeNotificationDetail = async (notification: INotification) => {
    await dispatch(
      readNotification({
        ids: [notification.id],
      }),
    );
    Promise.allSettled([dispatch(countNotificationNotRead()), initFetchListNotiPopup()]);

    switch (notification.type) {
      case NotificationType.PoolRequest:
        const poolRequestID = notification.data ? Number(JSON.parse(notification.data).poolId) : null;
        history.push(`/user/account/notification/${notification.id}?poolId=${poolRequestID}`);
        break;
      case NotificationType.PoolSwapFee:
        history.push(`/pools/${notification.data ? JSON.parse(notification.data).poolId : null}`);
        break;
      case NotificationType.Wallet:
      case NotificationType.Confidence:
        history.push(`/user/account/setting`);
        break;
      case NotificationType.OrderBookTradingFee:
        const isStellar = notification.message.toLowerCase().includes('stellar');
        const isBSC = notification.message.toLowerCase().includes('bsc');

        if (isStellar) {
          dispatch(setSelectedMethods([tradingMethodOptions[0]]));
          history.push(routeConstants.DASHBOARD);
        } else if (isBSC) {
          dispatch(setSelectedMethods([tradingMethodOptions[1]]));
          history.push(routeConstants.DASHBOARD);
        }
        break;
      case NotificationType.Coin:
        const assets = getAllAssetsFromCoins(JSON.parse(notification.data));
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

  const handleDeleteAll = async () => {
    await dispatch(deleteAllNotifications());
    await dispatch(countNotificationNotRead());
    await dispatch(getListNotifications(DEFAULT_PAGINATION));
    await setCurrentPage(1);
    await setIsRead(undefined);
    setShowConfirm(false);
    setClickDeleteAll(!clickDeleteAll);
  };

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

  return (
    <LayoutAccount>
      <div className={cx('header')}>
        <h3 className={cx('notification')}>Notifications</h3>

        <div className={cx('action')}>
          <CCheckbox
            size="small"
            content="Hide read notifications"
            onClick={() => (isRead === ReadStatus.Unread ? setIsRead(undefined) : setIsRead(ReadStatus.Unread))}
            checked={isRead === ReadStatus.Unread}
          ></CCheckbox>
          <Tooltip title={`Mark all as read`}>
            <img src={theme === THEME_MODE.DARK ? list_dark : list_light} onClick={handleMarkAllRead}></img>
          </Tooltip>

          <Tooltip title={`Delete all`}>
            <img
              src={Delete_dark}
              onClick={() => {
                setShowConfirm(true);
              }}
            ></img>
          </Tooltip>
        </div>
      </div>

      {listNotifications?.length > 0 ? (
        <div className={cx('base-info')}>
          {listNotifications?.map((item, index) => (
            <div className={cx('element')} key={index} onClick={() => seeNotificationDetail(item)}>
              <div className={cx('line')}>
                {item.is_read === ReadStatus.Unread ? <img src={dot_light}></img> : <img src={dot_dark}></img>}
                <span className={cx('title')}>{item.message}</span>
                <span className={cx('time')}>{convertTime(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cx('no-notification')}>{<div>No notification</div>}</div>
      )}

      {listNotifications?.length > 0 && totalPage > 1 ? (
        <div className={cx('footer-pagination')}>
          <Pagination
            className={classes.pagination}
            count={totalPage}
            page={currentPage}
            variant="outlined"
            shape="rounded"
            onChange={handleChangePage}
          />
        </div>
      ) : (
        <div></div>
      )}

      <Dialog
        style={{ padding: '30px 30px' }}
        className={cx('dialog')}
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title" className={cx('title')}>
          Delete all
        </DialogTitle>
        <DialogContent className={cx('content')}>
          <div>Are you sure you want to delete all </div>
          <div>notifications?</div>
        </DialogContent>
        <DialogActions className={cx('actions')}>
          <Button
            onClick={() => {
              setShowConfirm(false);
            }}
            className={cx('button')}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteAll} className={cx('button')}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutAccount>
  );
};
export default AccountNotification;
