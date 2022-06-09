/* eslint-disable max-len */
import { Box, ButtonBase, Dialog, IconButton, InputBase, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React, { ChangeEvent, useState } from 'react';
import BscSVG from 'src/assets/icon/BscSVG';
import StellarSVG from 'src/assets/icon/StellarSVG';
import Button from 'src/components/Base/Button/Button';
import Checkbox from 'src/components/Base/Checkbox/Checkbox';
import { HardwareWallet, Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import {
  MISSING_EXTENSION_ERROR,
  SoftwareWalletType,
} from 'src/features/ConnectWallet/constants/uninstallExtensionException';
import {
  connectFreighter,
  connectHardwareWallet,
  connectMetaMask,
  getCurrentChainId,
  getCurrentStellarNetwork,
  isCorrectNetworkBsc,
  isCorrectNetworkStellar,
} from 'src/features/ConnectWallet/helpers/connectWallet';
import { DialogData } from 'src/features/ConnectWallet/interfaces/WalletData';
import {
  disconnectStellar,
  setAddressIsUsedWarning,
  setBsc,
  setFreighter,
  setFreighterAddressForTrustline,
  setInstallationRequestWarning,
  setLedger,
  setLedgerAddressForTrustline,
  setOpenAlreadyWhitelistDialog,
  setOpenConnectDialog,
  setOpenStellarAccountIsNotActiveWarning,
  setOpenWarningModal,
  setOpenWrongNetworkWarning,
  setPrivateKey,
  setPrivateKeyOfAddressForTrustline,
  setTrezor,
  setTrezorAddressForTrustline,
  setWalletAddressForWhiteListing,
} from 'src/features/ConnectWallet/redux/wallet';
import { checkWhitelistBSC, checkWhitelistStellar, createUserWallet } from 'src/features/ConnectWallet/service';
import styles from 'src/features/ConnectWallet/styles/ConnectWalletDialog.module.scss';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import { getPublicKeyFromPrivateKey, isStellarAccountActive, isStellarSecret } from 'src/helpers/stellarHelper/address';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

const ConnectWalletDialog: React.FC = () => {
  const [secret, setSecret] = useState<string | null>();
  // error message in submit private key dialog
  const [errorMessage, setErrorMessage] = useState<string>('');
  const pairs = useAppSelector((state) => state.allPairs.pairs.data);
  const wallet = useAppSelector((state) => state.wallet);
  const openConnectDialog = useAppSelector((state) => state.wallet.openConnectDialog);
  const [openConnectHardwareWalletDialog, setOpenConnectHardwareWalletDialog] = useState<boolean>(false);
  const [selectedHardwareWallet, setSelectedHardwareWallet] = useState<HardwareWallet>(Trezor);
  const [useDefaultAccount, setUseDefaultAccount] = useState<boolean>(true);
  const [bipPath, setBipPath] = useState<string>('');
  const [openInputPrivateKeyDialog, setOpenInputPrivateKeyDialog] = useState<boolean>(false);
  const [openConnectMetaMaskNotification, setOpenConnectMetaMaskNotification] = useState<boolean>(false);
  const [openConnectFreighterNotification, setOpenConnectFreighterNotification] = useState<boolean>(false);
  const openAlreadyWhitelistDialog = useAppSelector((state) => state.wallet.openAlreadyWhitelistDialog);
  const walletAddressForWhiteListing = useAppSelector((state) => state.wallet.walletAddressForWhiteListing);
  const dispatch = useAppDispatch();

  // // check whitelist
  // const checkWhiteListBSC = async (address: string) => {
  //   const res = await checkWhitelistBSCService(address);
  //   dispatch(setWhiteList(res));
  //   if (!res) {
  //     dispatch(setOpenWarningModal(true));
  //   }
  // };
  // const checkWhiteListStellar = async (address: string, selectedPair: Pair) => {
  //   const res = await checkWhiteListStellarService(address, selectedPair);
  //   dispatch(setWhiteList(res));
  //   if (!res) {
  //     dispatch(setOpenWarningModal(true));
  //   }
  // };

  // Connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };
  const handleCloseConnectDialog = () => {
    dispatch(setOpenConnectDialog(false));
  };

  // Connect hardware wallet dialog
  const handleOpenConnectHardwareWalletDialog = () => {
    setOpenConnectHardwareWalletDialog(true);
  };
  const handleCloseConnectHardwareWalletDialog = () => {
    setOpenConnectHardwareWalletDialog(false);
  };

  // Input private key dialog
  const handleOpenInputPrivateKeyDialog = () => {
    setSecret('');
    setErrorMessage('');
    setOpenInputPrivateKeyDialog(true);
  };
  const handleCloseInputPrivateKeyDialog = () => {
    setOpenInputPrivateKeyDialog(false);
  };

  // warning address is used
  const handleOpenAddressIsUsedWarning = (dialogData: DialogData) => {
    dispatch(setAddressIsUsedWarning(dialogData));
  };

  // already whitelist dialog
  const handleOpenAlreadyWhitelistDialog = () => {
    dispatch(setOpenAlreadyWhitelistDialog(true));
  };
  const handleCloseAlreadyWhitelistDialog = () => {
    dispatch(setOpenAlreadyWhitelistDialog(false));
  };

  // Connect MetaMask notification
  const handleOpenConnectMetaMaskNotification = () => {
    setOpenConnectMetaMaskNotification(true);
  };
  const handleCloseConnectMetaMaskNotification = () => {
    setOpenConnectMetaMaskNotification(false);
  };

  // Connect Freighter notification
  const handleOpenConnectFreighterNotification = () => {
    setOpenConnectFreighterNotification(true);
  };
  const handleCloseConnectFreighterNotification = () => {
    setOpenConnectFreighterNotification(false);
  };

  const handleOpenStellarAccountIsNotActiveWarning = () => {
    dispatch(setOpenStellarAccountIsNotActiveWarning(true));
  };
  // Connect MetaMask
  const handleConnectMetaMask = async () => {
    try {
      if (wallet.bsc) {
        handleOpenConnectMetaMaskNotification();
      } else {
        // connect
        const publicKey = await connectMetaMask();
        // if (true) {
        const createUserWalletResponse = await createUserWallet(publicKey, 'addNewWallet');
        if (createUserWalletResponse === 1) {
          if (await checkWhitelistBSC(publicKey)) {
            // check chainId
            if (isCorrectNetworkBsc(getCurrentChainId())) {
              dispatch(setBsc(publicKey));
            } else {
              dispatch(setOpenWrongNetworkWarning(!isCorrectNetworkBsc(getCurrentChainId())));
            }
          } else {
            dispatch(setWalletAddressForWhiteListing(publicKey));
            dispatch(setOpenWarningModal(true));
          }
        } else if (createUserWalletResponse === 2) {
          dispatch(setWalletAddressForWhiteListing(publicKey));
          handleOpenAlreadyWhitelistDialog();
        } else {
          handleOpenAddressIsUsedWarning({
            open: true,
            address: publicKey,
          });
        }
      }
    } catch (e) {
      if (e.message === MISSING_EXTENSION_ERROR) {
        dispatch(setInstallationRequestWarning({ open: true, walletType: SoftwareWalletType.METAMASK }));
      }
    }
    handleCloseConnectDialog();
  };

  // Connect Freighter
  const handleConnectFreighter = async (isUpdate = false) => {
    try {
      const publicKey = await connectFreighter();
      if (publicKey === wallet.freighter) {
        if (!isUpdate) {
          handleOpenConnectFreighterNotification();
        }
      } else {
        dispatch(disconnectStellar());
        if (await isStellarAccountActive(publicKey)) {
          const createUserWalletResponse = await createUserWallet(publicKey, 'addNewWallet');
          if (createUserWalletResponse === 1) {
            if (await checkWhitelistStellar(publicKey, pairs)) {
              dispatch(setFreighter(publicKey));

              // check network
              dispatch(setOpenWrongNetworkWarning(!isCorrectNetworkStellar(await getCurrentStellarNetwork())));
            } else {
              dispatch(setFreighterAddressForTrustline(publicKey));
              dispatch(setWalletAddressForWhiteListing(publicKey));
              dispatch(setOpenWarningModal(true));
            }
          } else if (createUserWalletResponse === 2) {
            dispatch(setWalletAddressForWhiteListing(publicKey));
            handleOpenAlreadyWhitelistDialog();
          } else {
            handleOpenAddressIsUsedWarning({
              open: true,
              address: publicKey,
            });
          }
        } else {
          handleOpenStellarAccountIsNotActiveWarning();
        }
      }
    } catch (e) {
      if (e.message === MISSING_EXTENSION_ERROR) {
        dispatch(setInstallationRequestWarning({ open: true, walletType: SoftwareWalletType.FREIGHTER }));
      }
    }
    handleCloseConnectDialog();
  };

  // Connect Trezor
  const handleConnectTrezor = () => {
    handleCloseConnectDialog();
    setSelectedHardwareWallet(Trezor);
    setUseDefaultAccount(true);
    setBipPath(Trezor.defaultStellarPath);
    handleOpenConnectHardwareWalletDialog();
  };
  const submitConnectTrezor = async () => {
    const path = useDefaultAccount ? Trezor.defaultStellarPath : bipPath;
    const publicKey = await connectHardwareWallet(HardwareWalletType.TREZOR, path);
    if (publicKey) {
      dispatch(disconnectStellar());
      if (await isStellarAccountActive(publicKey)) {
        const createUserWalletResponse = await createUserWallet(publicKey, 'addNewWallet');
        if (createUserWalletResponse === 1 && pairs) {
          if (await checkWhitelistStellar(publicKey, pairs)) {
            dispatch(setTrezor({ path, publicKey }));
            // dispatch(setWalletAddressForWhiteListing(publicKey));
          } else {
            dispatch(setTrezorAddressForTrustline({ path, publicKey }));
            dispatch(setWalletAddressForWhiteListing(publicKey));
            dispatch(setOpenWarningModal(true));
          }
        } else if (createUserWalletResponse === 2) {
          dispatch(setWalletAddressForWhiteListing(publicKey));
          handleOpenAlreadyWhitelistDialog();
        } else {
          handleOpenAddressIsUsedWarning({
            open: true,
            address: publicKey,
          });
        }
      } else {
        handleOpenStellarAccountIsNotActiveWarning();
      }
      handleCloseConnectHardwareWalletDialog();
    }
  };

  // Connect Ledger
  const handleConnectLedger = async () => {
    handleCloseConnectDialog();
    setSelectedHardwareWallet(Ledger);
    setUseDefaultAccount(true);
    setBipPath(Ledger.defaultStellarPath);
    handleOpenConnectHardwareWalletDialog();
  };
  const submitConnectLedger = async () => {
    const path = useDefaultAccount ? Ledger.defaultStellarPath : bipPath;
    const publicKey = await connectHardwareWallet(HardwareWalletType.LEDGER, Ledger.defaultStellarPath);
    if (publicKey) {
      dispatch(disconnectStellar());
      if (await isStellarAccountActive(publicKey)) {
        const createUserWalletResponse = await createUserWallet(publicKey, 'addNewWallet');
        if (createUserWalletResponse === 1 && pairs) {
          if (await checkWhitelistStellar(publicKey, pairs)) {
            dispatch(setLedger({ path, publicKey }));
            // dispatch(setWalletAddressForWhiteListing(publicKey));
          } else {
            dispatch(setLedgerAddressForTrustline({ path, publicKey }));
            dispatch(setWalletAddressForWhiteListing(publicKey));
            dispatch(setOpenWarningModal(true));
          }
        } else if (createUserWalletResponse === 2) {
          dispatch(setWalletAddressForWhiteListing(publicKey));
          handleOpenAlreadyWhitelistDialog();
        } else {
          handleOpenAddressIsUsedWarning({
            open: true,
            address: publicKey,
          });
        }
      } else {
        handleOpenStellarAccountIsNotActiveWarning();
      }
      handleCloseConnectHardwareWalletDialog();
    }
  };

  const handleCheckUsingDefaultAccount = () => {
    setUseDefaultAccount(!useDefaultAccount);
    setBipPath(selectedHardwareWallet.defaultStellarPath);
  };

  const handleOnChangeBipPath = (e: ChangeEvent<HTMLInputElement>) => {
    setBipPath(e.target.value);
  };

  // Connect with private key
  const handleConnectUsingPrivateKey = () => {
    handleCloseConnectDialog();
    handleOpenInputPrivateKeyDialog();
  };
  const submitPrivateKey = async () => {
    if (secret) {
      dispatch(disconnectStellar());
      if (await isStellarAccountActive(getPublicKeyFromPrivateKey(secret))) {
        const createUserWalletResponse = await createUserWallet(getPublicKeyFromPrivateKey(secret), 'addNewWallet');
        if (createUserWalletResponse === 1 && pairs) {
          if (await checkWhitelistStellar(getPublicKeyFromPrivateKey(secret), pairs)) {
            dispatch(setPrivateKey(secret));
            setSecret('');
            // dispatch(setWalletAddressForWhiteListing(getPublicKeyFromPrivateKey(secret)));
          } else {
            dispatch(setPrivateKeyOfAddressForTrustline(secret));
            dispatch(setWalletAddressForWhiteListing(getPublicKeyFromPrivateKey(secret)));
            dispatch(setOpenWarningModal(true));
          }
        } else if (createUserWalletResponse === 2) {
          dispatch(setWalletAddressForWhiteListing(getPublicKeyFromPrivateKey(secret)));
          handleOpenAlreadyWhitelistDialog();
        } else {
          handleOpenAddressIsUsedWarning({
            open: true,
            address: getPublicKeyFromPrivateKey(secret),
          });
        }
      } else {
        handleOpenStellarAccountIsNotActiveWarning();
      }
      setSecret('');
      handleCloseInputPrivateKeyDialog();
    }
  };
  const handleOnChangePrivateKey = (e: ChangeEvent<HTMLInputElement>) => {
    setSecret(e.target.value);
  };
  const validPrivateKey = !!(secret && isStellarSecret(secret));

  // get short address
  const getShortAddress = (address: string) => {
    return address.slice(0, 2) + '...' + address.slice(-4);
  };

  return (
    <>
      {/* Connect option*/}
      <Dialog
        open={openConnectDialog}
        onClose={handleCloseConnectDialog}
        fullWidth={true}
        maxWidth={'xs'}
        disableEscapeKeyDown={true}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Connect wallet</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseConnectDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <ButtonBase disableRipple={true} className={cx('button')} onClick={handleConnectMetaMask}>
          <BscSVG size={'xl'} />
          <p>MetaMask</p>
        </ButtonBase>

        <ButtonBase
          disableRipple={true}
          className={cx('button', 'stellar-icon')}
          onClick={() => {
            handleConnectFreighter();
          }}
        >
          <StellarSVG size={'xl'} />
          <p>Freighter</p>
        </ButtonBase>

        <ButtonBase disableRipple={true} className={cx('button', 'stellar-icon')} onClick={handleConnectTrezor}>
          <StellarSVG size={'xl'} />
          <p>Trezor</p>
        </ButtonBase>

        <ButtonBase disableRipple={true} className={cx('button', 'stellar-icon')} onClick={handleConnectLedger}>
          <StellarSVG size={'xl'} />
          <p>Ledger</p>
        </ButtonBase>

        <ButtonBase
          disableRipple={true}
          className={cx('button', 'stellar-icon')}
          onClick={handleConnectUsingPrivateKey}
        >
          <StellarSVG size={'xl'} />
          <p>Input private key</p>
        </ButtonBase>
      </Dialog>

      {/* Connect hardware wallet dialog*/}
      <Dialog
        open={openConnectHardwareWalletDialog}
        onClose={handleCloseConnectHardwareWalletDialog}
        fullWidth={true}
        maxWidth={'sm'}
        disableEscapeKeyDown={true}
      >
        <div className={cx('group-btn')}>
          <Typography component={'div'}>
            <IconButton onClick={handleCloseConnectHardwareWalletDialog} size={'small'} className={cx('close-btn')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </div>
        <div className={cx('connect-hardware-wallet-info')}>
          <Typography component={'div'} className={cx('title')}>
            <Box>Connect with {selectedHardwareWallet.name}</Box>
          </Typography>
          <div className={cx('info')}>Use FCX with your {selectedHardwareWallet.name} account</div>
          {/* TODO: logo*/}
        </div>
        <div className={cx('connect-hardware-wallet-form')}>
          <div className={cx('set-default-account')}>
            <Checkbox
              onClick={handleCheckUsingDefaultAccount}
              checked={useDefaultAccount}
              content={'Use default account'}
            />
          </div>
          <div className={cx('bip-path')}>
            <p>Enter bip path</p>
            <InputBase
              className={cx('input')}
              value={bipPath}
              onChange={handleOnChangeBipPath}
              disabled={useDefaultAccount}
            />
          </div>
          <Button
            size={'lg'}
            type={'primary'}
            content={`Connect with ${selectedHardwareWallet.name}`}
            onClick={
              selectedHardwareWallet.type === HardwareWalletType.TREZOR ? submitConnectTrezor : submitConnectLedger
            }
            classNamePrefix={cx('connect-btn')}
          />
        </div>
      </Dialog>

      {/* Input private key*/}
      <Dialog
        open={openInputPrivateKeyDialog}
        onClose={handleCloseInputPrivateKeyDialog}
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
            <Box>Input private key</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseInputPrivateKeyDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>
        <div className={cx('form')}>
          <InputBase
            className={cx('input')}
            placeholder={'Input private key'}
            value={secret}
            onChange={handleOnChangePrivateKey}
            onBlur={() => {
              !validPrivateKey
                ? setErrorMessage('Please input valid private key for that supports Stellar')
                : setErrorMessage('');
            }}
          />
          {errorMessage && <div className={cx('error-message')}>{errorMessage}</div>}
          <Button
            classNamePrefix={cx('submit-private-key-btn')}
            size={'lg'}
            type={'primary'}
            fullWidth={true}
            content={'Submit'}
            onClick={submitPrivateKey}
            isDisabled={!validPrivateKey}
          />
        </div>
      </Dialog>

      {/* Connect MetaMask notification*/}
      <Dialog
        open={openConnectMetaMaskNotification}
        onClose={handleCloseConnectMetaMaskNotification}
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
            <Box>Change wallet address on MetaMask</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseConnectMetaMaskNotification} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('notification-container')}>
          <div className={cx('notification-body')}>
            Please open MetaMask extension in your browser to change wallet address
          </div>
        </div>
      </Dialog>

      {/* Connect Freighter notification*/}
      <Dialog
        open={openConnectFreighterNotification}
        onClose={handleCloseConnectFreighterNotification}
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
            <Box>Change wallet address on Freighter</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseConnectFreighterNotification} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('notification-container')}>
          <div className={cx('notification-body')}>
            Please open Freighter extension in your browser to change wallet address. After that, click Update address
            change to update the change. If you do not click Update address change, you still connect to the old wallet
            address
          </div>
          <div className={cx('btn-group')}>
            <Button
              classNamePrefix={cx('update-address-change-btn')}
              content={'Update address change'}
              fullWidth={true}
              size={'lg'}
              type={'primary'}
              onClick={() => {
                handleConnectFreighter(true);
                handleCloseConnectFreighterNotification();
              }}
            />
          </div>
        </div>
      </Dialog>

      {/* already whitelist dialog*/}
      <Dialog
        open={openAlreadyWhitelistDialog}
        onClose={handleCloseAlreadyWhitelistDialog}
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
            <Box>Your address {getShortAddress(walletAddressForWhiteListing)} is pending for whitelisting!</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton onClick={handleCloseAlreadyWhitelistDialog} size={'small'} className={cx('close-button')}>
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('body-container')}>
          <div className={cx('body', 'text-center')}>
            You will receive an email when the process is complete. <br />
            You can not trade with an unwhitelisted address. <br />
            Would you like to use another address?
          </div>
          <div className={cx('btn-group')}>
            <ButtonBase
              className={cx('btn-submit')}
              disableRipple={true}
              onClick={() => {
                handleCloseAlreadyWhitelistDialog();
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

export default ConnectWalletDialog;
