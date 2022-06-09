import classnames from 'classnames/bind';
import React from 'react';
import { tradingMethodOptions } from 'src/components/Navigation/contants';
import { TradingMethodItem } from 'src/interfaces';
import { THEME_MODE } from 'src/interfaces/theme';
import styles from './SelectedTradingMethods.module.scss';

const cx = classnames.bind(styles);

const totalTradingMethods = tradingMethodOptions.length;

interface SelectedTradingMethodsProps {
  selectedMethods: Array<TradingMethodItem>;
  theme: THEME_MODE;
}

const SelectedTradingMethods: React.FC<SelectedTradingMethodsProps> = ({
  selectedMethods,
  theme,
}: SelectedTradingMethodsProps) => {
  return (
    <>
      {selectedMethods.length === totalTradingMethods ? (
        'All'
      ) : (
        <div className={cx('selected-item')}>
          {selectedMethods.map((item, key) => {
            if (key === 0) {
              return (
                <>
                  <div className={cx('icon')}>
                    <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
                  </div>
                  <div className={cx('symbol')}>{item.symbol}</div>
                </>
              );
            } else if (key !== 0) {
              return (
                <>
                  &nbsp;
                  <div className={cx('symbol')}>&</div>
                  &nbsp;
                  <div className={cx('icon')}>
                    <img src={theme === THEME_MODE.DARK ? item.darkIcon : item.lightIcon} />
                  </div>
                  <div className={cx('symbol')}>{item.symbol}</div>
                </>
              );
            }
          })}
        </div>
      )}
    </>
  );
};

export default SelectedTradingMethods;
