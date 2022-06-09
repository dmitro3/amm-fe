import React, { useEffect } from 'react';
import { THEME_MODE } from 'src/interfaces/theme';
import styles from './TopNav.module.scss';
import classnames from 'classnames/bind';
import { SelectItem } from 'src/interfaces/user';
import { useHistory } from 'react-router';
import { TradingMethodItem } from 'src/interfaces';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setSelectedMethods } from './redux/tradingMethods.slice';
// eslint-disable-next-line max-len
import { accountOptions, tradeOptions, tradingMethodOptions } from './contants';
import { routeConstants } from 'src/constants';
import { removeAllCookieStorage, setOneCookieStorage } from 'src/helpers/storage';
import { setTheme } from 'src/store/theme/theme';
import { disconnectAll } from 'src/features/ConnectWallet/redux/wallet';
import { getMe, setSelectedFunctionalCurrencyId } from 'src/store/auth';
import { updateFunCurrencies } from 'src/features/User/redux/apis';
import _ from 'lodash';
import { formatEmail } from 'src/features/User/Account/Management/Setting/AccountBaseInfo';
import { isShowTradingChart } from 'src/features/TradingViewChart/Components/redux/ChartRedux.slide';
import CheckboxImage from 'src/components/Base/CheckboxImage';
const cx = classnames.bind(styles);

export const TradeItems = (theme: string): Array<JSX.Element> => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const isShowTradingViewChart = (item: string) => {
    if (item === tradeOptions[0].text) {
      dispatch(isShowTradingChart(true));
    }
  };

  return tradeOptions.map((item: any, index: number) => (
    <div
      key={index}
      className={cx('dropdown-item')}
      onClick={() => {
        history.push(item.url);
        isShowTradingViewChart(item.text);
      }}
    >
      <div className={cx('icon')}>
        <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
      </div>
      <div>{item.text}</div>
    </div>
  ));
};

const sortFuntionalCurrencies = (functionalCurrencies: Array<SelectItem>, selectedCurrency: SelectItem): number[] => {
  const listFunCurSorted = _.cloneDeep(functionalCurrencies);
  const idxDeleted = functionalCurrencies.findIndex((e) => e.value === selectedCurrency.value);
  if (idxDeleted >= 0) {
    listFunCurSorted.splice(idxDeleted, 1);
    listFunCurSorted.unshift(selectedCurrency);
  }
  return listFunCurSorted.map((item) => item.value);
};

export const Currencies = (functionalCurrencies: Array<SelectItem>): Array<JSX.Element> => {
  const dispatch = useAppDispatch();
  return functionalCurrencies.map((currency: SelectItem) => (
    <div
      key={currency.key}
      className={cx('dropdown-item')}
      onClick={async () => {
        dispatch(setSelectedFunctionalCurrencyId(+currency.key));
        await dispatch(
          updateFunCurrencies({ functional_currencies: sortFuntionalCurrencies(functionalCurrencies, currency) }),
        );
        await dispatch(getMe());
      }}
    >
      {currency.text}
    </div>
  ));
};

export const Account = (theme: string): Array<JSX.Element> => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const userLogin = useAppSelector((state) => state.auth.currentUser);

  return accountOptions.map((item: any, index: number) => (
    <>
      {item.text !== 'email' ? (
        <div
          key={index}
          className={cx('dropdown-item')}
          onClick={() => {
            if (item.url === routeConstants.SIGN_IN) {
              removeAllCookieStorage(['access_token', 'refresh_token']);
              dispatch(setTheme(THEME_MODE.LIGHT));
              dispatch(disconnectAll());
            }
            history.push(item.url);
          }}
        >
          <div className={cx('icon')}>
            <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
          </div>
          <div>{item.text}</div>
        </div>
      ) : (
        <div key={index} className={cx('dropdown-item')}>
          <div>{formatEmail(userLogin.email)}</div>
        </div>
      )}
    </>
  ));
};

export const TradingMethods = (theme: string): Array<JSX.Element> => {
  const dispatch = useAppDispatch();
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);

  useEffect(() => {
    setOneCookieStorage('trading_method', JSON.stringify(selectedMethods));
  }, [selectedMethods.length]);

  const handleSelectTradingMethod = (item: TradingMethodItem, isSelected: boolean) => {
    // const valueSelectedMethodChange =
    isSelected && selectedMethods.length > 1
      ? dispatch(setSelectedMethods(selectedMethods.filter((method: TradingMethodItem) => method.key !== item.key)))
      : !isSelected && dispatch(setSelectedMethods([...selectedMethods, item]));
  };
  return tradingMethodOptions.map((item: TradingMethodItem) => {
    let isSelected: TradingMethodItem | undefined = undefined;
    if (selectedMethods.length > 0) isSelected = selectedMethods.find((method) => method.key === item.key);
    return (
      <div
        key={item.key}
        className={cx('dropdown-item')}
        onClick={() => handleSelectTradingMethod(item, isSelected !== undefined)}
      >
        <CheckboxImage
          size="sm"
          // value={item.key.toString()}
          checked={isSelected !== undefined}
          onClick={() => handleSelectTradingMethod(item, isSelected !== undefined)}
        />
        <div className={cx('icon')}>
          <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
        </div>
        <div>{item.text}</div>
      </div>
    );
  });
};
