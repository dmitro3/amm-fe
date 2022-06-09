import React from 'react';
import styles from 'src/features/MarketTrade/styles/MarketTrade.module.scss';
import classnames from 'classnames/bind';
import moment from 'moment';
import { useAppSelector } from 'src/store/hooks';
import { THEME_MODE } from 'src/interfaces/theme';
import { TradingMethod } from 'src/constants/dashboard';
import { bscIcon, combineOBIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';

const cx = classnames.bind(styles);

interface IMarketTrade {
  thead?: string[];
  tbody: any[];
}

const CMarketTrade: React.FC<IMarketTrade> = ({ thead = [], tbody = [] }) => {
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
    <div className={cx('market-trade-table')}>
      {!!thead.length && (
        <div className={cx('ordertable__head--wrapper')}>
          <div className={cx('ordertable__head')}>
            {thead.map((item: string) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
      <div className={cx('market-trade-body')}>
        {tbody.map((item, index) => (
          <div className={cx('ordertable__body')} key={index}>
            <span
              className={cx('ordertable__body--price')}
              style={{
                color: item.buyer_is_taker ? '#06c270' : '#ff3b3b',
              }}
            >
              {item.method && <img src={getIconNetwork(item.method)} />}
              <span>{item.price}</span>
            </span>
            <span className={cx('ordertable__body--amount')}>{item.filled_amount}</span>
            <span className={cx('ordertable__body--total')}>
              {item.created_at === '--' ? '--' : moment(item.created_at).format('HH:mm:ss')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CMarketTrade;
