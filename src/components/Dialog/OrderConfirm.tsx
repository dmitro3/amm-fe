/* eslint-disable max-len */
import { Box, Button, Dialog, DialogContent, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React, { useState } from 'react';
import styles from './dialog.module.scss';

const cx = classnames.bind(styles);

const OrderConfirm: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth={true} maxWidth={'xs'}>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Order confirmation</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>
        <DialogContent className={cx('dialog-content')}>Method:</DialogContent>
        <DialogContent className={cx('dialog-content')}>SOR type:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Order type:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Buy:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Price:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Amount:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Slippage tolerance:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Fee:</DialogContent>
        <DialogContent className={cx('dialog-content')}>Warp digital credits back to original wallet:</DialogContent>
        <Button className={cx('button-dialog')}>Trade</Button>
      </Dialog>
    </>
  );
};

export default OrderConfirm;
