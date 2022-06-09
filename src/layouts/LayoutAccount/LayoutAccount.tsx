import React from 'react';
import classnames from 'classnames/bind';
import styles from './LayoutAccount.module.scss';

interface Props {
  children?: React.ReactNode;
  pathRoute?: string;
  screen?: string;
}

const cx = classnames.bind(styles);
const LayoutAccount: React.FC<Props> = ({ children, screen }) => {
  return (
    <div style={{ display: 'flex' }}>
      <div className={cx('container', screen === 'balances' ? 'balances' : '')}>{children}</div>
    </div>
  );
};

export default LayoutAccount;
