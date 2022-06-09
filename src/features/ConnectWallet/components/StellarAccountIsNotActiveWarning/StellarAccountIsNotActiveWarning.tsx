import React from 'react';
import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from 'src/assets/icon/warning.svg';
import Button from 'src/components/Base/Button/Button';
import styles from './StellarAccountIsNotActiveWarning.module.scss';
import classnames from 'classnames/bind';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setOpenConnectDialog, setOpenStellarAccountIsNotActiveWarning } from 'src/features/ConnectWallet/redux/wallet';

const cx = classnames.bind(styles);

const StellarAccountIsNotActiveWarning: React.FC = () => {
  const openStellarAccountIsNotActiveWarning = useAppSelector(
    (state) => state.wallet.openStellarAccountIsNotActiveWarning,
  );
  const dispatch = useAppDispatch();

  // connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const handleCloseStellarAccountIsNotActiveWarning = () => {
    dispatch(setOpenStellarAccountIsNotActiveWarning(false));
  };

  return (
    <>
      {/*  warning stellar account is not active*/}
      <Dialog
        open={openStellarAccountIsNotActiveWarning}
        onClose={handleCloseStellarAccountIsNotActiveWarning}
        fullWidth={true}
        maxWidth={'sm'}
        disableEscapeKeyDown={true}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Warning</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton
              onClick={handleCloseStellarAccountIsNotActiveWarning}
              size={'small'}
              className={cx('close-button')}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>
            Your stellar address has not been activated. Please activate your address by sending at least 1 XLM to it.
          </div>

          <Button
            content={'Use another address'}
            type={'primary'}
            size={'md'}
            fullWidth={true}
            onClick={() => {
              handleOpenConnectDialog();
              handleCloseStellarAccountIsNotActiveWarning();
            }}
          />
        </div>
      </Dialog>
    </>
  );
};

export default StellarAccountIsNotActiveWarning;
