import React from 'react';
import { Box, ButtonBase, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from 'src/assets/icon/warning.svg';
import styles from 'src/features/OrderForm/components/WrongNetWorkWarning2/WrongNetworkWarning2.module.scss';
import classnames from 'classnames/bind';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setOpenWrongNetworkWarning2 } from 'src/features/OrderForm/redux/orderForm';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';

const cx = classnames.bind(styles);

const WrongNetworkWarning2: React.FC = () => {
  const openWrongNetworkWarningDialog = useAppSelector((state) => state.orderForm.wrongNetworkWarning2.open);
  const checkNetworkData = useAppSelector((state) => state.orderForm.wrongNetworkWarning2.checkNetworkData);

  const dispatch = useAppDispatch();

  const handleCloseWrongNetworkWaringDialog = () => {
    dispatch(setOpenWrongNetworkWarning2(false));
  };

  // Connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  return (
    <>
      {/* Wrong network warning*/}
      <Dialog
        open={openWrongNetworkWarningDialog}
        onClose={handleCloseWrongNetworkWaringDialog}
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
            <IconButton onClick={handleCloseWrongNetworkWaringDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-wrong-network-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>{checkNetworkData.message}</div>

          <ButtonBase
            onClick={() => {
              handleOpenConnectDialog();
              handleCloseWrongNetworkWaringDialog();
            }}
            className={cx('connect-wallet-primary-max-width')}
            disableRipple={true}
          >
            Connect wallet
          </ButtonBase>
        </div>
      </Dialog>
    </>
  );
};

export default WrongNetworkWarning2;
