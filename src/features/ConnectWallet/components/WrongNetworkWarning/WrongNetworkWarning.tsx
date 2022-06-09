import React from 'react';
import styles from './WrongNetworkWarning.module.scss';
import classnames from 'classnames/bind';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from 'src/assets/icon/warning.svg';
import { setOpenWrongNetworkWarning } from 'src/features/ConnectWallet/redux/wallet';

const cx = classnames.bind(styles);

const WrongNetworkWarning: React.FC = () => {
  const openWrongNetworkWarning = useAppSelector((state) => state.wallet.openWrongNetworkWarning);
  const dispatch = useAppDispatch();

  const handleCloseWrongNetworkWarning = () => {
    dispatch(setOpenWrongNetworkWarning(false));
  };

  return (
    <>
      {/*  warning user are connecting wrong network*/}
      <Dialog
        open={openWrongNetworkWarning}
        onClose={handleCloseWrongNetworkWarning}
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
            <IconButton onClick={handleCloseWrongNetworkWarning} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>
            You are connecting to wrong network. Please connect to the appropriate network in your wallet settings
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default WrongNetworkWarning;
