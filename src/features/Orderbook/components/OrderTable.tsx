/* eslint-disable max-len */
import classnames from 'classnames/bind';
import React from 'react';
import { bscIcon, combineOBIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';
import { TradingMethod } from 'src/constants/dashboard';
import styles from 'src/features/Orderbook/stypes/OrderBookStellar.module.scss';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

interface IOrderBookStellar {
  thead?: string[];
  tbody: any[];
  color?: string;
  textColor?: string;
}

const OrderBookStellarTable: React.FC<IOrderBookStellar> = ({
  thead = [],
  color = 'red',
  tbody = [],
  textColor = 'red',
}) => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const getIconNetwork = (method?: TradingMethod) => {
    if (method === TradingMethod.StellarOrderbook) {
      return theme === THEME_MODE.LIGHT ? StellarOrderBookLightIcon : StellarOrderBookDarkIcon;
    }
    if (method === TradingMethod.BSCOrderbook) {
      return bscIcon;
    }
    if (method === TradingMethod.CombinedOrderbook) {
      return combineOBIcon;
    }
  };

  return (
    <div>
      {!!thead.length && (
        <div className={cx('ordertable__head')}>
          {thead.map((item: string) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      )}
      {tbody.map((item, index) => (
        <div className={cx('ordertable__body')} key={index}>
          <span
            className={cx('ordertable__body--price')}
            style={{ color: textColor, display: 'flex', alignItems: 'center' }}
          >
            {item.price !== '--' && <img className={cx('icon-network')} src={getIconNetwork(item.method)} />}
            <span>{item.price}</span>
          </span>
          <span className={cx('ordertable__body--amount')}>{item.amount}</span>
          <span className={cx('ordertable__body--total')}>{item.total}</span>
          <div
            className={cx('ordertable-overlay')}
            style={{
              background: `${color}`,
              width: `${item.percent}%`,
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default OrderBookStellarTable;
