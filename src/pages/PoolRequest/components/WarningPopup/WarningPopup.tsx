import React from 'react';
import { Dialog } from '@material-ui/core';
import classNames from 'classnames/bind';
import styles from './WarningPopup.module.scss';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import { ReactComponent as SuccessIcon } from 'src/assets/icon/success.svg';

interface Props {
  open: boolean;
  handleClose: () => void;
  success?: boolean;
}

const cx = classNames.bind(styles);

const WarningPopup: React.FC<Props> = ({ open, handleClose, success = false }) => {
  return (
    <Dialog fullWidth maxWidth="xs" className={cx('dialog-root')} open={open} onClose={handleClose}>
      <div className={cx('dialog-header')}>
        <div style={{ width: '28px', height: '28px' }}></div>

        {!success ? <div>Warning!</div> : <div>Thank you</div>}

        <CloseIcon onClick={handleClose} />
      </div>

      <div className={cx('dialog-body')}>
        {!success ? (
          <>
            <WarningIcon />
            <span>You have reach the maximum number of pool requests.</span>
            <span>Please wait for Velo admin to review your requests.</span>
          </>
        ) : (
          <>
            <SuccessIcon />
            <span>
              Your pool request has been sent to our Velo Lab’s Admin team. Our team will contact you shortly to verify
              your pool creation request.
            </span>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default WarningPopup;
