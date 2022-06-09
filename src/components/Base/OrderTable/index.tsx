import React from 'react';
import styles from './style.module.scss';
import classnames from 'classnames/bind';
import hardwarewalletdark from 'src/assets/icon/hardwallet-dark.svg';
import hardwarewalletlight from 'src/assets/icon/hardwallet-light.svg';
import { useAppSelector } from 'src/store/hooks';
import { THEME_MODE } from 'src/interfaces/theme';

const cx = classnames.bind(styles);

interface ICOrderTable {
  thead?: string[];
  tbody: any[];
  color?: string;
  textColor?: string;
}

const COrderTable: React.FC<ICOrderTable> = ({ thead = [], color = 'red', tbody = [], textColor = 'red' }) => {
  const theme = useAppSelector((state) => state.theme.themeMode);

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
            <img src={theme === THEME_MODE.LIGHT ? hardwarewalletlight : hardwarewalletdark} />
            <span>{item.price}</span>
          </span>
          <span className={cx('ordertable__body--amount')}>{item.amount}</span>
          <span className={cx('ordertable__body--total')}>{item.total}</span>
          <div
            className={cx('ordertable-overlay')}
            style={{
              background: `${color}`,
              width: '50px',
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default COrderTable;
