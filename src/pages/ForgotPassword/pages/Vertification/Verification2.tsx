import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './styles';
import stylesSCSS from './styles/Verification.module.scss';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import { checkPassToken } from 'src/store/auth';
import { useAppDispatch } from 'src/store/hooks';
import OtpInput from 'react-otp-input';
import { useEffect } from 'react';
import { replaceMail } from 'src/helpers/user';
import Error from 'src/components/Form/Error';

const cx = classNames.bind(stylesSCSS);

interface VerificationProps {
  email: string;
  resendCode: (email: string | undefined) => void;
  setResetPassword: (resetPassword: boolean) => void;
  setPassToken: React.Dispatch<React.SetStateAction<string>>;
  setVerification: React.Dispatch<React.SetStateAction<boolean>>;
  getPassTokenSuccess: boolean;
}

const Verification2: React.FC<VerificationProps> = ({
  email,
  setVerification,
  resendCode,
  setResetPassword,
  setPassToken,
  getPassTokenSuccess,
}) => {
  const dispatch = useAppDispatch();
  const classes = styles();

  const [countdown, setCountdown] = useState<number>(60);
  const [otp, setOtp] = useState<string>('');
  const [notEnoughDigit, setNotEnoughDigit] = useState<boolean>(false);
  const [wrongOtp, setWrongOtp] = useState<boolean>(false);

  const handleChange = (otp: string) => {
    setOtp(otp);
    if (otp.length === 6 && notEnoughDigit === true) setNotEnoughDigit(false);
    if (wrongOtp === true) setWrongOtp(false);
  };

  const onResendCode = () => {
    setNotEnoughDigit(false);
    resendCode(email);
    setWrongOtp(false);
    setOtp('');
    if (getPassTokenSuccess === true) setCountdown(60);
  };

  useEffect(() => {
    if (countdown <= 0) return;

    const intervalId = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown]);

  const onHandleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!otp || otp.length < 6) {
      setNotEnoughDigit(true);
      return;
    }

    if (otp) {
      const res = await dispatch(checkPassToken({ email, token: otp }));

      if (res.payload.data === true) {
        setResetPassword(true);
        setPassToken(otp);
        setVerification(false);
      } else setWrongOtp(true);
    }
  };

  return (
    <div className={cx('verification')}>
      <div className={cx('form-container-margin')}>
        <div className={cx('form-container')}>
          <Typography className={cx('title')}>Verification</Typography>

          <Typography className={cx('sub-title')}>A code has been sent to your email {replaceMail(email)}</Typography>

          <form className={classes.form} onSubmit={onHandleSubmit}>
            <Typography className={cx('label')}>Enter code:</Typography>
            <div className={cx('otp-wrapper')}>
              <OtpInput
                value={otp}
                onChange={handleChange}
                numInputs={6}
                isInputNum
                shouldAutoFocus
                containerStyle={cx('otp-input')}
              />
            </div>
            {notEnoughDigit === true && <Error errorName="This field is required." />}
            {wrongOtp === true && <Error errorName="Your verification code is incorrect!" />}

            <div className={cx('resend-code-wrapper')}>
              {countdown === 0 && (
                <div className={cx('resend-code')}>
                  <div onClick={() => onResendCode()}>Resend code</div>
                </div>
              )}
              <div className={cx('countdown')}>{countdown}s</div>
            </div>

            <Button variant="contained" color="primary" type="submit" className={classes.button}>
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verification2;
