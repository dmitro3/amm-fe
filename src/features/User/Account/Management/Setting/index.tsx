import classnames from 'classnames/bind';
import React from 'react';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import AccountBaseInfo from './AccountBaseInfo';
import ConnectedWallets from './ConnectWallets';
import Currencies from './Currencies';
import styles from './Setting.module.scss';
import ConfidenceInterval from './ConfidenceInterval';
import Notifications from './Notifications/Notifications';
import useScrollToTop from 'src/hooks/useScrollToTop';

const cx = classnames.bind(styles);
const AccountSetting: React.FC = () => {
  useScrollToTop();

  return (
    <LayoutAccount>
      <h3 className={cx('title')}>Account Settings</h3>
      <div className={cx('wrap-container')}>
        <AccountBaseInfo />

        <Currencies />

        <ConnectedWallets />

        <ConfidenceInterval />

        <Notifications />
      </div>
    </LayoutAccount>
  );
};

export default AccountSetting;
