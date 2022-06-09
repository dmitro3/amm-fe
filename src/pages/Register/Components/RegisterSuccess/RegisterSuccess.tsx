import React from 'react';
import classNames from 'classnames/bind';
import styles from './RegisterSuccess.module.scss';
import PrimaryButton from 'src/components/PrimaryButton';
import SuccessIcon from 'src/assets/icon/success.svg';
import { routeConstants } from 'src/constants';
import { useHistory } from 'react-router-dom';
const cx = classNames.bind(styles);

const RegisterSuccess: React.FC = () => {
  const history = useHistory();
  return (
    <div className={cx('success-form-wrapper')}>
      <div className={cx('success-container-margin')}>
        <div className={cx('success-container')}>
          <img className={cx('success-icon')} src={SuccessIcon} />

          <div className={cx('success-content')}>
            Your registration has been sent to the Velo Lab’s Admin Team. A confirmation email will be sent to your
            address when the account is verified.
          </div>

          <PrimaryButton className={cx('comeback-homepage-btn')} onClick={() => history.push(routeConstants.SIGN_IN)}>
            Come back to homepage
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
