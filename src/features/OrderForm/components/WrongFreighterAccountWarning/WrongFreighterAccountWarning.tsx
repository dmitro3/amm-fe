import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React from 'react';
import WarningIcon from 'src/assets/icon/warning.svg';
import { setOpenWrongFreighterAccountWarning } from 'src/features/OrderForm/redux/orderForm';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from './WrongFreighterAccountWarning.module.scss';

const cx = classnames.bind(styles);

const WrongFreighterAccountWarning: React.FC = () => {
  const openWrongFreighterAccountWarning = useAppSelector((state) => state.orderForm.openWrongFreighterAccountWarning);
  const freighterWallet = useAppSelector((state) => state.wallet.freighter);
  const dispatch = useAppDispatch();

  const handleCloseWrongFreighterAccountWarning = () => {
    dispatch(setOpenWrongFreighterAccountWarning(false));
  };

  const getShortAddress = (address: string) => {
    return address.slice(0, 2) + '...' + address.slice(-4);
  };

  return (
    <>
      {/* Wrong network warning*/}
      <Dialog
        open={openWrongFreighterAccountWarning}
        onClose={handleCloseWrongFreighterAccountWarning}
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
            <IconButton onClick={handleCloseWrongFreighterAccountWarning} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-wrong-network-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>
            Your transaction failed because you’ve changed to another account on Freighter. Please open your Freighter
            extension and change the account back to {getShortAddress(freighterWallet)}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default WrongFreighterAccountWarning;
