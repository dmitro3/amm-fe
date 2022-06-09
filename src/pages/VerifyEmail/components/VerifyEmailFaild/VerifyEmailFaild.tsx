import React from 'react';
import classNames from 'classnames/bind';
import styles from './VerifyEmailFaild.module.scss';
import bigWarningIcon from 'src/assets/icon/bigWarningIcon.svg';

const cx = classNames.bind(styles);

const VerifyEmailFaild: React.FC = () => {
  return (
    <div className={cx('verify-email-faild')}>
      <div className={cx('verify-email-faild-container-margin')}>
        <div className={cx('verify-email-faild-container')}>
          <div className={cx('icon')}>
            <img src={bigWarningIcon} />
          </div>

          <div className={cx('verify-email-faild-title')}>Confirmation failed!</div>

          <div className={cx('verify-email-faild-content')}>
            Your confirmation has failed. Please try confirm again via your email.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailFaild;
