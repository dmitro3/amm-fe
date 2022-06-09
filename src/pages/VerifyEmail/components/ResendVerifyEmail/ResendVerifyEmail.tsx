import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ResendVerifyEmail.module.scss';
import SuccessIcon from 'src/assets/icon/success.svg';
import PrimaryButton from 'src/components/PrimaryButton';

const cx = classNames.bind(styles);

interface ResendVerifyEmailProps {
  email: string;
  resendVerifyEmail: () => any;
}

const ResendVerifyEmail: React.FC<ResendVerifyEmailProps> = ({ email, resendVerifyEmail }) => {
  const countDownSec = 60;
  const [countDown, setCountDown] = useState<number>(countDownSec);
  const [btnDisable, setBtnDisable] = useState<boolean>(true);

  const resendVerifyEmailHandle = async () => {
    const res = await resendVerifyEmail();

    if (res?.payload.code === 0) {
      setCountDown(countDownSec);
      setBtnDisable(true);
    }
  };

  useEffect(() => {
    if (countDown <= 0) {
      setBtnDisable(false);
      return;
    }

    const intervalId = setInterval(() => {
      setCountDown(countDown - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countDown]);

  return (
    <div className={cx('resend-verify-email')}>
      <div className={cx('resend-verify-email-container-margin')}>
        <div className={cx('resend-verify-email-container')}>
          <div className={cx('icon')}>
            <img src={SuccessIcon} />
          </div>

          <div className={cx('resend-verify-email-title')}>Check your email for confirmation</div>

          <div className={cx('resend-verify-email-content')}>
            An email has been sent to your email <span className={cx('email-address')}>{email}</span> with a link to
            confirm your registration. Please check your spam if you have not received it within the next 5 minutes.
          </div>

          <PrimaryButton
            className={cx('resend-verify-email-resend-btn')}
            disable={btnDisable}
            onClick={resendVerifyEmailHandle}
          >
            Resend email ({countDown}s)
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ResendVerifyEmail;
