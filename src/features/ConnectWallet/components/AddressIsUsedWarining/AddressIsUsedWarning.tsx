import React from 'react';
import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from 'src/assets/icon/warning.svg';
import Button from 'src/components/Base/Button/Button';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from 'src/features/ConnectWallet/components/AddressIsUsedWarining/AddressIsUsedWarning.module.scss';
import classnames from 'classnames/bind';
import { setAddressIsUsedWarning, setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';

const cx = classnames.bind(styles);

const AddressIsUsedWarning: React.FC = () => {
  const openAddressIsUsedWarning = useAppSelector((state) => state.wallet.addressIsUsedWarning.open);
  const addressIsUsedWarning = useAppSelector((state) => state.wallet.addressIsUsedWarning.address);
  const dispatch = useAppDispatch();

  // connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  // warning address is used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCloseAddressIsUsedWarning = () => {
    dispatch(
      setAddressIsUsedWarning({
        open: false,
        address: '',
      }),
    );
  };

  // get short address
  const getShortAddress = (address: string) => {
    return address.slice(0, 2) + '...' + address.slice(-4);
  };

  return (
    <>
      {/*  warning address is whitelisted for another account*/}
      <Dialog
        open={openAddressIsUsedWarning}
        onClose={handleCloseAddressIsUsedWarning}
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
            <IconButton onClick={handleCloseAddressIsUsedWarning} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>
            This address {getShortAddress(addressIsUsedWarning)} is already whitelisted for another account. Please use
            another account
          </div>

          <Button
            content={'Use another address'}
            type={'primary'}
            size={'md'}
            fullWidth={true}
            onClick={() => {
              handleOpenConnectDialog();
              handleCloseAddressIsUsedWarning();
            }}
          />
        </div>
      </Dialog>
    </>
  );
};

export default AddressIsUsedWarning;
