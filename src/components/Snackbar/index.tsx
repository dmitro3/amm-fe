import { Fade } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { closeSnackbar } from 'src/store/snackbar';
import './style.scss';

const CustomSnackbar: React.FC = () => {
  const snackbar = useAppSelector((state) => state.snackbar);
  const dispatch = useAppDispatch();
  const handleClose = (event: any, reason: any) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(closeSnackbar());
  };
  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.isOpen}
        autoHideDuration={5000}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <div className={`snackbar color-${snackbar.variant}`}>{snackbar.message}</div>
      </Snackbar>
    </div>
  );
};

export default CustomSnackbar;
