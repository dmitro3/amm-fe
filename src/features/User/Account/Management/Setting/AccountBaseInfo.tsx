import classnames from 'classnames/bind';
import React, { useState } from 'react';
import { useAppSelector } from 'src/store/hooks';
import { SCREEN_MODE } from './Setting.constant';
import styles from './Setting.module.scss';
import EditPassword from './EditPassword/EditPassword';
import { formatTime } from './formatTime';

const cx = classnames.bind(styles);

export const formatEmail = (str: string): string => {
  if (str) {
    const arrStr = str.split('@');
    if (arrStr[0] && arrStr[1] && arrStr[0].length > 2) {
      return arrStr[0].substr(0, 2) + '***' + '@' + arrStr[1];
    }
  }
  return str;
};

const AccountBaseInfo: React.FC = () => {
  const [screenMode, setScreenMode] = useState(SCREEN_MODE.VIEW);

  const userLogin = useAppSelector((state) => state.auth.currentUser);

  const handleBackToModeView = () => {
    setScreenMode(SCREEN_MODE.VIEW);
  };

  const renderModeView = () => {
    return (
      <div className={cx('base-info')}>
        <div>
          <div>{formatEmail(userLogin.email)}</div>
          <div>Last login time: {formatTime(userLogin.last_login)}</div>
          <div>IP: {userLogin.IP}</div>
        </div>
        <div className={cx('button-edit')} onClick={() => setScreenMode(SCREEN_MODE.EDIT)}>
          Change password
        </div>
      </div>
    );
  };

  const renderModeEdit = () => {
    return <EditPassword handleBackToModeView={() => handleBackToModeView()} />;
  };
  return (
    <div>
      <div>{screenMode === SCREEN_MODE.VIEW ? renderModeView() : renderModeEdit()}</div>
    </div>
  );
};

export default AccountBaseInfo;
