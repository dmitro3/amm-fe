import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React from 'react';
import WarningIcon from 'src/assets/icon/warning.svg';
import Button from 'src/components/Base/Button/Button';
import { StellarTransactionErrorCode } from 'src/features/OrderForm/constants/error';
import { cancelStellarOffer } from 'src/features/OrderForm/helpers/cancelStellarOffer';
import {
  setIsCanceling,
  setOpenCancelStellarOrder,
  setOpenWrongFreighterAccountWarning,
} from 'src/features/OrderForm/redux/orderForm';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from './CancelStellarOrder.module.scss';

const cx = classnames.bind(styles);

const CancelStellarOrder: React.FC = () => {
  const openCancelStellarOrder = useAppSelector((state) => state.orderForm.cancelStellarOrder.open);
  const isCancelingOrder = useAppSelector((state) => state.orderForm.cancelStellarOrder.isCanceling);
  const orderId = useAppSelector((state) => state.orderForm.cancelStellarOrder.orderId);
  const stellarOfferId = useAppSelector((state) => state.orderForm.cancelStellarOrder.stellarOfferId);
  const wallet = useAppSelector((state) => state.wallet);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);

  const dispatch = useAppDispatch();

  const handleCloseCancelStellarOrderDialog = () => {
    dispatch(setOpenCancelStellarOrder(false));
  };

  // wrong freighter account warning
  const handleOpenWrongFreighterAccountWarning = () => {
    dispatch(setOpenWrongFreighterAccountWarning(true));
  };

  const handleCancelOrder = async () => {
    try {
      dispatch(setIsCanceling(true));
      await cancelStellarOffer(stellarOfferId, wallet, selectedPair);
    } catch (e) {
      if (e === StellarTransactionErrorCode.TX_BAD_AUTH) {
        handleOpenWrongFreighterAccountWarning();
      }
      // TODO: catch error
    }
    handleCloseCancelStellarOrderDialog();
  };

  return (
    <>
      <Dialog
        open={openCancelStellarOrder}
        onClose={handleCloseCancelStellarOrderDialog}
        fullWidth={true}
        maxWidth={'sm'}
        disableBackdropClick={isCancelingOrder}
        disableEscapeKeyDown={true}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Cancel order</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton
              onClick={handleCloseCancelStellarOrderDialog}
              size={'small'}
              className={cx('close-button')}
              disabled={isCancelingOrder}
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
            Your order {orderId} can not be executed entirely. Please cancel the order now.
            <br />
            If you do not cancel the order, it will remain as a limit order until you cancel.
          </div>

          <Button
            content={'Cancel order'}
            type={'error'}
            size={'md'}
            fullWidth={true}
            onClick={handleCancelOrder}
            isDisabled={isCancelingOrder}
            isLoading={isCancelingOrder}
          />
        </div>
      </Dialog>
    </>
  );
};

export default CancelStellarOrder;
