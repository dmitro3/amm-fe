import React from 'react';
import classNames from 'classnames/bind';
import styles from './LoginAttemptsExceeded.module.scss';
import bigWarningIcon from 'src/assets/icon/bigWarningIcon.svg';

const cx = classNames.bind(styles);

interface LoginAttemptsExceededProps {
  setIsShowScreenLock: React.Dispatch<React.SetStateAction<boolean>>;
  alt: string;
}

const LoginAttemptsExceeded: React.FC<LoginAttemptsExceededProps> = ({ setIsShowScreenLock, alt }) => {
  return (
    <div className={cx('login-attempts-exceeded')}>
      <div className={cx('login-attempts-exceeded-container-margin')}>
        <div className={cx('login-attempts-exceeded-container')}>
          <div className={cx('icon')}>
            <img src={bigWarningIcon} alt={alt} onClick={() => setIsShowScreenLock(false)} />
          </div>

          <div className={cx('login-attempts-exceeded-content')}>
            You have reached maximum login attempts. Your account has been locked. Please contact Velo admin via{' '}
            <span className={cx('email-address')}>fcxadmin@velo.org</span> to reactivate your account.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAttemptsExceeded;
