import { Box, ButtonBase, Dialog, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SuccessIcon from 'src/assets/icon/success.svg';
import WarningIcon from 'src/assets/icon/warning.svg';
import Button from 'src/components/Base/Button/Button';
import CModal from 'src/components/Base/Modal';
import { getAllUntrustedAssets } from 'src/features/ConnectWallet/helpers/getAllUntrustedAssets';
import {
  setAssetsForTrustline,
  setOpenConnectDialog,
  setOpenSuccessDialog,
  setOpenTrustlineAndSubmitDialog,
  setOpenWarningModal,
} from 'src/features/ConnectWallet/redux/wallet';
import { createUserWallet } from 'src/features/ConnectWallet/service';
import { getPublicKeyFromPrivateKey } from 'src/helpers/stellarHelper/address';
import { trustAllAssets } from 'src/helpers/stellarHelper/trustAllAssets';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Asset } from 'stellar-sdk';
import styles from './WhiteListWarningModal.module.scss';

const cx = classnames.bind(styles);

interface WhiteListWarningModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
}

const WhiteListWarningModal: React.FC<WhiteListWarningModalProps> = ({ open, onClose }: WhiteListWarningModalProps) => {
  const walletAddressForWhiteListing = useAppSelector((state) => state.wallet.walletAddressForWhiteListing);
  const walletAddressForTrustline = useAppSelector((state) => state.wallet.walletAddressForTrustline);
  const openTrustlineAndSubmitDialog = useAppSelector((state) => state.wallet.openTrustlineAndSubmitDialog);
  const assetsForTrustline = useAppSelector((state) => state.wallet.assetsForTrustline);
  const openSuccessDialog = useAppSelector((state) => state.wallet.openSuccessDialog);
  const allCoins = useAppSelector((state) => state.allCoins.coins.data);
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittingAndWhitelisting, setIsSubmittingAndWhitelisting] = useState<boolean>(false);

  // Close warning dialog
  const handleCloseWarning = () => {
    dispatch(setOpenWarningModal(false));
  };

  // Connect dialog and close whitelist warning modal
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  // Trustline and submit for whitelist dialog
  const handleOpenDialogTrustline = () => {
    dispatch(setOpenTrustlineAndSubmitDialog(true));
  };
  const handleCloseDialogTrustline = () => {
    dispatch(setOpenTrustlineAndSubmitDialog(false));
  };

  // success dialog
  const handleOpenSuccessDialog = () => {
    dispatch(setOpenSuccessDialog(true));
  };
  const handleCloseSuccessDialog = () => {
    dispatch(setOpenSuccessDialog(false));
  };

  const handleClickSubmitAddress = async () => {
    try {
      setIsSubmitting(true);

      const address =
        walletAddressForTrustline.freighter ||
        walletAddressForTrustline.trezor.publicKey ||
        walletAddressForTrustline.ledger.publicKey ||
        getPublicKeyFromPrivateKey(walletAddressForTrustline.privateKey) ||
        '';
      const allUntrustedAssets: Array<Asset> = await getAllUntrustedAssets(address, allCoins);

      if (allUntrustedAssets.length) {
        dispatch(setAssetsForTrustline(allUntrustedAssets));
        handleCloseWarning();
        handleOpenDialogTrustline();
      } else {
        const res = await createUserWallet(walletAddressForWhiteListing, 'submitForWhitelist');
        if (res === 1) {
          handleOpenSuccessDialog();
        } else {
          throw res;
        }
        handleCloseWarning();
      }
    } catch (e) {
      // console.log(e);
      handleCloseWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickTrustlineAndSubmit = async () => {
    try {
      setIsSubmittingAndWhitelisting(true);
      await trustAllAssets(walletAddressForTrustline, assetsForTrustline);
      const res = await createUserWallet(walletAddressForWhiteListing, 'submitForWhitelist');
      if (res === 1) {
        handleOpenSuccessDialog();
      } else {
        throw res;
      }
    } catch (e) {
      handleCloseDialogTrustline();
    } finally {
      setIsSubmittingAndWhitelisting(false);
      handleCloseDialogTrustline();
    }
  };

  // get short address
  const getShortAddress = (address: string) => {
    return address.slice(0, 2) + '...' + address.slice(-4);
  };

  return (
    <>
      <CModal title="Warning!" open={open} onClose={onClose}>
        <div className={cx('content')}>
          <div className={cx('warning-icon')}>
            <img src={WarningIcon} alt={'warning icon'} />
          </div>
          <div className={cx('description')}>
            You can not trade with an unwhitelisted address. Would you like to submit this address for whitelisting?
          </div>
          <Button
            content={'Submit address'}
            type={'primary'}
            size={'md'}
            onClick={handleClickSubmitAddress}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          />
          <a
            className={cx('other-address-btn')}
            onClick={() => {
              handleCloseWarning();
              handleOpenConnectDialog();
            }}
          >
            Use another address
          </a>
        </div>
      </CModal>

      {/* set up address to trade on stellar*/}
      <Dialog
        open={openTrustlineAndSubmitDialog}
        onClose={handleCloseDialogTrustline}
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
            <Box>Set up your address to trade on Stellar</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseDialogTrustline} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('body-container')}>
          <div className={cx('body')}>
            To trade on FCX - Stellar Dex, you need to:
            <li>Establish trustline for all FCX digital credits on your wallet address</li>
            <li>Submit address for whitelisting by Velo admin</li>
          </div>
          <div className={cx('btn-group')}>
            <Button
              content={'Establish trustline and submit adderss'}
              type={'primary'}
              size={'md'}
              onClick={handleClickTrustlineAndSubmit}
              isLoading={isSubmittingAndWhitelisting}
              isDisabled={isSubmittingAndWhitelisting}
            />
          </div>
        </div>
      </Dialog>

      {/* success dialog*/}
      <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog} maxWidth={'sm'} disableEscapeKeyDown={true}>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseSuccessDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('body-container')}>
          <div className={cx('success-icon')}>
            <img src={SuccessIcon} alt={'success icon'} />
          </div>
          <div className={cx('body')}>
            Your wallet address {getShortAddress(walletAddressForWhiteListing)} has been sent to Velo admin
          </div>
          <div className={cx('btn-group')}>
            <Link to={'/user/dashboard/balances'} className={cx('btn-submit')} onClick={handleCloseSuccessDialog}>
              Manage wallets
            </Link>
            <ButtonBase
              className={cx('btn-use-another-address')}
              disableRipple={true}
              onClick={() => {
                handleCloseSuccessDialog();
                handleOpenConnectDialog();
              }}
            >
              Use another address
            </ButtonBase>
          </div>
        </div>
      </Dialog>
    </>
  );
};
export default WhiteListWarningModal;
