/* eslint-disable max-len */
import { Box, Button, Dialog, DialogContent, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React, { useState } from 'react';
import warningIcon from 'src/assets/img/warning-icon.png';
import successIcon from 'src/assets/img/success-icon.png';
import styles from './dialog.module.scss';

const cx = classnames.bind(styles);

interface IDialog {
  title?: string;
  mode?: 'success' | 'warning';
  handleSubmit?: any;
  content?: string;
  handleDirect?: any;
}

const DialogStatus: React.FC<IDialog> = (props) => {
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
            <Box>{props.title}</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>
        <div className={cx('icon')}>
          <img src={props.mode === 'warning' ? warningIcon : successIcon}></img>
        </div>
        <DialogContent className={cx('dialog-content')}>{props.content}</DialogContent>
        <Button className={cx('button-dialog')} onClick={props.handleSubmit}>
          Submit address
        </Button>
        <div className={cx('link-under')} onClick={props.handleDirect}>
          Use another address
        </div>
      </Dialog>
    </>
  );
};

export default DialogStatus;
