/* eslint-disable max-len */
import React from 'react';
import { Box, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from 'src/assets/icon/warning.svg';
import Button from 'src/components/Base/Button/Button';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setInstallationRequestWarning } from 'src/features/ConnectWallet/redux/wallet';
import styles from 'src/features/ConnectWallet/components/ExtensionInstallationRequestDialog/ExtensionInstallationRequestWarning.module.scss';
import classnames from 'classnames/bind';
import { SoftwareWalletType } from 'src/features/ConnectWallet/constants/uninstallExtensionException';
import { FreighterInstallLink, MetaMaskInstallLink } from 'src/features/ConnectWallet/constants/installWalletLink';

const cx = classnames.bind(styles);

const ExtensionInstallationRequestWarning: React.FC = () => {
  const openInstallationRequestWarning = useAppSelector((state) => state.wallet.installationRequestWarning.open);
  const walletType = useAppSelector((state) => state.wallet.installationRequestWarning.walletType);
  const dispatch = useAppDispatch();

  const handleCloseInstallationRequestWarning = () => {
    dispatch(setInstallationRequestWarning({ open: false, walletType: SoftwareWalletType.METAMASK }));
  };

  const submitInstallButton = () => {
    walletType === SoftwareWalletType.METAMASK ? window.open(MetaMaskInstallLink) : window.open(FreighterInstallLink);
    handleCloseInstallationRequestWarning();
  };

  return (
    <>
      {/*  installation request warning*/}
      <Dialog
        open={openInstallationRequestWarning}
        onClose={handleCloseInstallationRequestWarning}
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
            <Box>Install {walletType}</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseInstallationRequestWarning} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('warning-body')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('content')}>You have not installed {walletType}. Please install to continue</div>

          <Button
            content={'Install ' + walletType}
            type={'primary'}
            size={'md'}
            fullWidth={true}
            onClick={submitInstallButton}
          />
        </div>
      </Dialog>
    </>
  );
};

export default ExtensionInstallationRequestWarning;
