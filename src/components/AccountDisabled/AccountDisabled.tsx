import React from 'react';
import classNames from 'classnames/bind';
import stylesSCSS from './styles/AccountDisabled.module.scss';
import bigWarningIcon from 'src/assets/icon/bigWarningIcon.svg';
import PrimaryButton from 'src/components/PrimaryButton';
import { routeConstants } from 'src/constants';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogProps } from '@material-ui/core';
import { useAppDispatch } from 'src/store/hooks';
import { accountDisabledClose } from 'src/store/accountDisabled';
import styles from './styles';

const cx = classNames.bind(stylesSCSS);

type AccountDisabledProps = DialogProps;

const AccountDisabled: React.FC<AccountDisabledProps> = ({ open }) => {
  const history = useHistory();
  const classes = styles();

  const dispatch = useAppDispatch();

  return (
    <Dialog open={open} aria-labelledby="add-wallets-addresses-dialog" className={classes.dialog}>
      <div className={cx('account-disabled-container')}>
        <div className={cx('wallet-dialog-title')}>Your account has been disabled</div>

        <img className={cx('icon')} src={bigWarningIcon} />

        <div className={cx('account-disabled-content')}>
          Your account has been disabled. Please contact Velo admin via{' '}
          <span className={cx('email-address')}>fcxadmin@velo.org</span> to reactivate your account.
        </div>

        <PrimaryButton
          className={cx('comeback-homepage-btn')}
          onClick={() => {
            dispatch(accountDisabledClose());
            history.push(routeConstants.LANDING);
          }}
        >
          I understand
        </PrimaryButton>
      </div>
    </Dialog>
  );
};

export default AccountDisabled;
