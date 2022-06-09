import '@fontsource/oswald';
import { AppBar, Box, Button, IconButton, Link, Toolbar, Typography } from '@material-ui/core';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import classNames from 'classnames/bind';
import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router';
import { Link as LinkRouter } from 'react-router-dom';
import notificationDark from 'src/assets/icon/notification-dark.svg';
import notificationLight from 'src/assets/icon/notification-light.svg';
import themeDark from 'src/assets/icon/theme-dark.svg';
import themeLight from 'src/assets/icon/theme-light.svg';
import userDark from 'src/assets/icon/user-dark.svg';
import userLight from 'src/assets/icon/user-light.svg';
import logoDark from 'src/assets/img/logo-dark.svg';
import logoLight from 'src/assets/img/logo-light.svg';
import { routeConstants, UserRole } from 'src/constants';
import ConnectWallet from 'src/features/ConnectWallet/components/ConnectWallet';
import { getAllTraderTicker, getPairs } from 'src/features/Pairs/redux/pair';
import { getCookieStorage, setOneCookieStorage } from 'src/helpers/storage';
import useReturnUrl from 'src/hooks/useReturnUrl';
import { THEME_MODE } from 'src/interfaces/theme';
import { SelectItem } from 'src/interfaces/user';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setTheme } from 'src/store/theme/theme';
import Dropdown from 'src/components/Dropdown';
import Notification from './components/Notification';
import SelectedTradingMethods from './components/SelectedTradingMethod';
import { loginFlowRoutes } from './contants';
import { getFunctionalCurrencies } from './redux/functionalCurrency.slice';
import { Account, Currencies, TradeItems, TradingMethods } from './renderComponents';
import {
  countNotificationNotRead,
  getListNotificationsPopup,
  initListNotificationsPopup,
} from 'src/features/User/Account/Management/Notiication/redux/apis';
import styles from './TopNav.module.scss';
import { ReadStatus } from 'src/features/User/Account/Management/Notiication/const';
import { isShowTradingChart } from 'src/features/TradingViewChart/Components/redux/ChartRedux.slide';
import store from 'src/store/store';
import { setCurPageNotiPopup } from 'src/features/User/Account/Management/Notiication/redux/notification.slice';

const cx = classNames.bind(styles);

export const initFetchListNotiPopup = async (): Promise<void> => {
  store.dispatch(initListNotificationsPopup({ page: 1, size: 20, is_read: ReadStatus.Unread }));
  store.dispatch(countNotificationNotRead());
};

const TopNav2: React.FunctionComponent = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [tradeRef, setTradeRef] = useState<HTMLButtonElement | null>(null);
  const [tradeFakeRef, setTradeFakeRef] = useState<HTMLButtonElement | null>(null);
  const [currencyRef, setCurrencyRef] = useState<HTMLButtonElement | null>(null);
  const [notiRef, setNotiRef] = useState<HTMLButtonElement | null>(null);
  const [tradingMethodRef, setTradingMethodRef] = useState<HTMLButtonElement | null>(null);
  const [accountRef, setAccountRef] = useState<HTMLButtonElement | null>(null);
  const [convertedFunctionalCurrencies, setConvertedFuncitionCurrencies] = useState<Array<SelectItem>>([]);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [
    theme,
    selectedMethods,
    functionalCurrencies,
    selectedFunctionalCurrencyId,
    currentUser,
    listNotificationsPopup,
    countNotiNotRead,
    curPageNoti,
  ] = useAppSelector((state) => [
    state.theme.themeMode,
    state.trading.selectedMethods,
    state.auth.currentUser.listUserFunCurrencies,
    state.auth.currentUser.selectedFunctionalCurrencyId,
    state.auth.currentUser,
    state.notification.listNotificationsPopup,
    state.notification.countNotRead,
    state.notification.curPageNotiPopup,
  ]);
  const urlRedirectAdmin = useReturnUrl();

  const onSwitchTheme = () => {
    const newTheme = theme === THEME_MODE.LIGHT ? THEME_MODE.DARK : THEME_MODE.LIGHT;
    newTheme === THEME_MODE.LIGHT ? setOneCookieStorage('theme', 'Light') : setOneCookieStorage('theme', 'Dark');

    dispatch(setTheme(newTheme));
  };
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location]);
  useEffect(() => {
    dispatch(getFunctionalCurrencies());
  }, [dispatch]);
  const fetchPairInfos = async () => {
    dispatch(getAllTraderTicker());
  };

  // useEffect(() => {
  //   dispatch(getMe());
  // }, [selectedFunctionalCurrencyId]);

  useEffect(() => {
    fetchPairInfos().then(() => {});
  }, []);

  useEffect(() => {
    // fetch data
    dispatch(getPairs());
  }, []);
  useEffect(() => {
    if (!!functionalCurrencies?.length)
      setConvertedFuncitionCurrencies(
        functionalCurrencies.map((item) => ({
          key: item.functional_currencies_id,
          value: item.functional_currencies_id,
          text: `${item.functional_currencies_currency}-${item.functional_currencies_symbol}`,
        })),
      );
  }, [functionalCurrencies]);

  const fetchListNotiPopup = async () => {
    if (getCookieStorage('access_token')) {
      await dispatch(getListNotificationsPopup({ page: curPageNoti + 1, size: 20, is_read: ReadStatus.Unread }));
      await dispatch(setCurPageNotiPopup(curPageNoti + 1));
    }
  };

  const isShowTradingViewChart = () => {
    dispatch(isShowTradingChart(true));
  };

  useEffect(() => {
    if (getCookieStorage('access_token')) {
      initFetchListNotiPopup();
    }
  }, [currentUser?.id]);

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.click();
    }
    setTimeout(() => {
      setTradeFakeRef(null);
    }, 1000);
  }, []);

  return (
    <>
      <AppBar position={'static'} className={cx('nav-bar')}>
        <Toolbar>
          <Box flexGrow={1} className={cx('logo')}>
            <img
              src={theme === THEME_MODE.LIGHT ? logoLight : logoDark}
              onClick={() => {
                history.push(!!getCookieStorage('access_token') ? routeConstants.DASHBOARD : routeConstants.LANDING);
                isShowTradingViewChart();
              }}
            />
          </Box>
          {!loginFlowRoutes.includes(currentRoute) && currentRoute !== routeConstants.LANDING && (
            <>
              <Box flexGrow={11}>
                <Button
                  endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                  className={cx('button')}
                  focusRipple={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setTradeRef(event.currentTarget)}
                >
                  <Typography className={cx('font-weight-bold', 'text-color')}>Trade</Typography>
                </Button>

                <LinkRouter style={{ textDecoration: 'none' }} to={`/pools`}>
                  <Button className={cx('button')}>
                    <Typography className={cx('font-weight-bold', 'text-color')}>Pool</Typography>
                  </Button>
                </LinkRouter>

                {[UserRole.SuperAdmin, UserRole.Admin].includes(currentUser.role) && (
                  <a href={urlRedirectAdmin} style={{ textDecoration: 'none' }}>
                    <Button className={cx('button')}>
                      <Typography className={cx('font-weight-bold', 'text-color')}>Admin</Typography>
                    </Button>
                  </a>
                )}
                {/* NOTE: FAKE CLICK EVENT TO FIXBUG CHANGE THEME SLOW */}
                <Button
                  ref={ref}
                  endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                  className={cx('hidden-trade-button')}
                  focusRipple={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setTradeFakeRef(event.currentTarget)}
                >
                  <Typography className={cx('font-weight-bold', 'text-color')}>Trade</Typography>
                </Button>
              </Box>
              {/* END */}
              <div className={cx('select-trading-btn')}>
                <Button
                  endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                  className={cx('button')}
                  focusRipple={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setTradingMethodRef(event.currentTarget)}
                >
                  <div className={cx('font-weight-bold', 'text-color')}>
                    {selectedMethods.length > 0 && (
                      <SelectedTradingMethods theme={theme} selectedMethods={selectedMethods} />
                    )}
                  </div>
                </Button>
              </div>

              <IconButton onClick={(event: React.MouseEvent<HTMLButtonElement>) => setAccountRef(event.currentTarget)}>
                <img src={theme === THEME_MODE.LIGHT ? userLight : userDark} />
              </IconButton>
              <IconButton onClick={(event: React.MouseEvent<HTMLButtonElement>) => setNotiRef(event.currentTarget)}>
                {countNotiNotRead <= 0 ? (
                  <img src={theme === THEME_MODE.LIGHT ? notificationLight : notificationDark} />
                ) : (
                  <div className={cx('notification')}>
                    <img src={theme === THEME_MODE.LIGHT ? notificationLight : notificationDark} />
                    <div>{countNotiNotRead > 9 ? '9+' : countNotiNotRead}</div>
                  </div>
                )}
              </IconButton>
              {!!functionalCurrencies?.length && selectedFunctionalCurrencyId && (
                <Button
                  endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                  className={cx('button')}
                  focusRipple={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setCurrencyRef(event.currentTarget)}
                >
                  <Typography className={cx('font-weight-bold', 'text-color')}>
                    {functionalCurrencies
                      ?.find((currency) => currency.functional_currencies_id === selectedFunctionalCurrencyId)
                      ?.functional_currencies_currency?.toUpperCase()}
                  </Typography>
                </Button>
              )}
              <ConnectWallet />
              <IconButton onClick={() => onSwitchTheme()}>
                <img src={theme === THEME_MODE.LIGHT ? themeLight : themeDark} />
              </IconButton>
            </>
          )}

          {currentRoute === routeConstants.LANDING && (
            <div className={cx('nav-landing')}>
              <Link className={cx('white-paper')} target="_blank" href="#">
                White paper
              </Link>

              <Button
                className={cx('signin-btn')}
                variant="contained"
                color="primary"
                onClick={() => history.push(routeConstants.SIGN_IN)}
              >
                Sign In
              </Button>

              <Button
                form="add-wallet-addresses-form"
                variant="contained"
                color="primary"
                type="submit"
                className={cx('register-btn')}
                onClick={() => history.push(routeConstants.REGISTER)}
              >
                Register
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Dropdown
        open={Boolean(tradeRef)}
        refElm={tradeRef}
        handleClose={() => setTradeRef(null)}
        items={TradeItems(theme)}
      />
      {/* NOTE: FAKE CLICK EVENT TO FIXBUG CHANGE THEME SLOW */}
      <Dropdown
        open={Boolean(tradeFakeRef)}
        refElm={tradeFakeRef}
        handleClose={() => setTradeFakeRef(null)}
        items={TradeItems(theme)}
        className={cx('hidden-trade-button')}
      />
      {/* END */}
      <Dropdown
        open={Boolean(currencyRef)}
        refElm={currencyRef}
        handleClose={() => setCurrencyRef(null)}
        items={Currencies(convertedFunctionalCurrencies)}
        className={cx('dropdown-currency')}
      />
      <Dropdown
        open={Boolean(accountRef)}
        refElm={accountRef}
        handleClose={() => setAccountRef(null)}
        items={Account(theme)}
        disableFirstItem={true}
      />
      <Dropdown
        open={Boolean(tradingMethodRef)}
        refElm={tradingMethodRef}
        handleClose={() => setTradingMethodRef(null)}
        items={TradingMethods(theme)}
        isMultipleChoice
      />

      <Notification
        open={Boolean(notiRef)}
        refElm={notiRef}
        handleClose={() => setNotiRef(null)}
        notifications={listNotificationsPopup.data}
        initFetchListNotiPopup={initFetchListNotiPopup}
        fetchListNotiPopup={fetchListNotiPopup}
        hasMore={curPageNoti < listNotificationsPopup?.metadata?.totalPage}
        theme={theme}
      />
    </>
  );
};

export default TopNav2;
