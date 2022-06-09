import React from 'react';
import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from 'src/assets/icon/warning.svg';
import styles from './OrderCannotBeExecutedWarning.module.scss';
import classnames from 'classnames/bind';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setOpenOrderCannotBeExecutedWarning } from 'src/features/OrderForm/redux/orderForm';

const cx = classnames.bind(styles);

const OrderCannotBeExecutedWarning: React.FC = () => {
  const openOrderCannotBeExecutedWarning = useAppSelector((state) => state.orderForm.openOrderCannotBeExecutedWarning);

  const dispatch = useAppDispatch();

  const handleCloseOrderCannotBeExecutedWarning = () => {
    dispatch(setOpenOrderCannotBeExecutedWarning(false));
  };

  return (
    <>
      {/*  order can not be executed right now warning */}
      <Dialog
        open={openOrderCannotBeExecutedWarning}
        onClose={handleCloseOrderCannotBeExecutedWarning}
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
            <IconButton onClick={handleCloseOrderCannotBeExecutedWarning} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>
            Sorry, your order can not be executed right now. <br />
            Please try again.
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default OrderCannotBeExecutedWarning;
