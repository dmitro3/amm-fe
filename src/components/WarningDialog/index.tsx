import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React from 'react';
import WarningIcon from 'src/assets/icon/warning.svg';
import styles from './style.module.scss';

const cx = classnames.bind(styles);

interface Props {
  openDialog: boolean;
  handleClose: () => void;
  message: string;
}

const WarningDialogBase: React.FC<Props> = ({ openDialog, handleClose, message }) => {
  return (
    <>
      <Dialog open={openDialog} onClose={handleClose} fullWidth={true} maxWidth={'sm'}>
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
            <IconButton onClick={handleClose} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>{message}</div>
        </div>
      </Dialog>
    </>
  );
};

export default WarningDialogBase;
