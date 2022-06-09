import React from 'react';
import classNames from 'classnames/bind';
import stylesCSS from './styles/VerifyEmailExpire.module.scss';
import bigWarningIcon from 'src/assets/icon/bigWarningIcon.svg';
import { useHistory } from 'react-router-dom';
import styles from './styles';
import { routeConstants } from 'src/constants';
import { Button } from '@material-ui/core';

const cx = classNames.bind(stylesCSS);

const VerifyEmailExpire: React.FC = () => {
  const history = useHistory();
  const classes = styles(styles);

  return (
    <div className={cx('verify-email-expire')}>
      <div className={cx('verify-email-expire-container-margin')}>
        <div className={cx('verify-email-expire-container')}>
          <div className={cx('icon')}>
            <img src={bigWarningIcon} />
          </div>

          <div className={cx('verify-email-expire-title')}>Confirmation link has expired!</div>

          <div className={cx('verify-email-expire-content')}>
            Your confirmation link has expired. Please register again
          </div>

          <div className={cx('btn-container')}>
            <Button
              className={`${classes.button} ${cx('hompage-btn')}`}
              variant="contained"
              color="primary"
              onClick={() => history.push(routeConstants.LANDING)}
            >
              Go to homepage
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={`${classes.button} ${cx('register-btn')}`}
              onClick={() => history.push(routeConstants.REGISTER)}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailExpire;
