import React from 'react';
import classNames from 'classnames/bind';
import styles from './VerifyEmailSuccess.module.scss';
import SuccessIcon from 'src/assets/icon/success.svg';
import PrimaryButton from 'src/components/PrimaryButton';
import { routeConstants } from 'src/constants';
import { useHistory } from 'react-router-dom';

const cx = classNames.bind(styles);

const VerifyEmailSuccess: React.FC = () => {
  const history = useHistory();

  return (
    <div className={cx('verify-email-success')}>
      <div className={cx('verify-email-success-container-margin')}>
        <div className={cx('verify-email-success-container')}>
          <div className={cx('icon')}>
            <img src={SuccessIcon} />
          </div>

          <div className={cx('verify-email-success-content')}>
            Your registration has been sent to the Velo Lab’s Admin Team. A confirmation email will be sent to your
            address when the account is verified.
          </div>

          <PrimaryButton
            className={cx('verify-email-success-btn')}
            onClick={() => history.push(routeConstants.SIGN_IN)}
          >
            Come back to homepage
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;
