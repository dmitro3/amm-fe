/* eslint-disable max-len */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HardwareWalletData } from 'src/features/ConnectWallet/interfaces/HardwareWalletData';
import { DialogData, WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { SoftwareWalletType } from 'src/features/ConnectWallet/constants/uninstallExtensionException';
import { Asset } from 'stellar-sdk';

const initialState: WalletData = {
  bsc: '',
  freighter: '',
  trezor: {
    path: '',
    publicKey: '',
  },
  ledger: {
    path: '',
    publicKey: '',
  },
  privateKey: '',
  // privateKey: 'SCTEV2QMFAYP4ODZVMPKXN24ZFBXOBIVTEP73XWYBMT44AVEGIIKCKTT',
  openConnectDialog: false,
  isWhiteList: false,
  isOpenWarningModal: false,
  walletAddressForWhiteListing: '',
  walletAddressForTrustline: {
    freighter: '',
    trezor: {
      path: '',
      publicKey: '',
    },
    ledger: {
      path: '',
      publicKey: '',
    },
    privateKey: '',
  },
  addressIsUsedWarning: {
    open: false,
    address: '',
  },
  installationRequestWarning: {
    open: false,
    walletType: SoftwareWalletType.METAMASK,
  },
  openWrongNetworkWarning: false,
  openStellarAccountIsNotActiveWarning: false,
  openAlreadyWhitelistDialog: false,
  openTrustlineAndSubmitDialog: false,
  assetsForTrustline: [],
  openSuccessDialog: false,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBsc: (state, action: PayloadAction<string>) => {
      state.bsc = action.payload;
    },
    setFreighter: (state, action: PayloadAction<string>) => {
      state.freighter = action.payload;
      // disconnect others
      state.trezor = {
        path: '',
        publicKey: '',
      };
      state.ledger = {
        path: '',
        publicKey: '',
      };
      state.privateKey = '';
    },
    setTrezor: (state, action: PayloadAction<HardwareWalletData>) => {
      state.trezor = action.payload;
      // disconnect others
      state.freighter = '';
      state.ledger = {
        path: '',
        publicKey: '',
      };
      state.privateKey = '';
    },
    setLedger: (state, action: PayloadAction<HardwareWalletData>) => {
      state.ledger = action.payload;
      // disconnect others
      state.freighter = '';
      state.trezor = {
        path: '',
        publicKey: '',
      };
      state.privateKey = '';
    },
    setPrivateKey: (state, action: PayloadAction<string>) => {
      state.privateKey = action.payload;
      // disconnect others
      state.freighter = '';
      state.trezor = {
        path: '',
        publicKey: '',
      };
      state.ledger = {
        path: '',
        publicKey: '',
      };
    },
    setOpenConnectDialog: (state, action: PayloadAction<boolean>) => {
      state.openConnectDialog = action.payload;
      if (action.payload) {
        state.walletAddressForTrustline.freighter = '';
        state.walletAddressForTrustline.trezor = {
          path: '',
          publicKey: '',
        };
        state.walletAddressForTrustline.ledger = {
          path: '',
          publicKey: '',
        };
        state.walletAddressForTrustline.privateKey = '';
        state.walletAddressForWhiteListing = '';
      }
    },

    setOpenWarningModal: (state, action: PayloadAction<boolean>) => {
      state.isOpenWarningModal = action.payload;
    },
    setWhiteList: (state, action: PayloadAction<boolean>) => {
      state.isWhiteList = action.payload;
    },
    setWalletAddressForWhiteListing: (state, action: PayloadAction<string>) => {
      state.walletAddressForWhiteListing = action.payload;
    },
    setAddressIsUsedWarning: (state, action: PayloadAction<DialogData>) => {
      state.addressIsUsedWarning = action.payload;
    },
    setInstallationRequestWarning: (
      state,
      action: PayloadAction<{ open: boolean; walletType: SoftwareWalletType }>,
    ) => {
      state.installationRequestWarning = action.payload;
    },

    // stellar account for trustline
    setFreighterAddressForTrustline: (state, action: PayloadAction<string>) => {
      state.walletAddressForTrustline.freighter = action.payload;
      state.walletAddressForTrustline.trezor = {
        path: '',
        publicKey: '',
      };
      state.walletAddressForTrustline.ledger = {
        path: '',
        publicKey: '',
      };
      state.walletAddressForTrustline.privateKey = '';
    },
    setTrezorAddressForTrustline: (state, action: PayloadAction<HardwareWalletData>) => {
      state.walletAddressForTrustline.trezor = action.payload;
      state.walletAddressForTrustline.freighter = '';
      state.walletAddressForTrustline.ledger = {
        path: '',
        publicKey: '',
      };
      state.walletAddressForTrustline.privateKey = '';
    },
    setLedgerAddressForTrustline: (state, action: PayloadAction<HardwareWalletData>) => {
      state.walletAddressForTrustline.ledger = action.payload;
      state.walletAddressForTrustline.freighter = '';
      state.walletAddressForTrustline.trezor = {
        path: '',
        publicKey: '',
      };
      state.walletAddressForTrustline.privateKey = '';
    },
    setPrivateKeyOfAddressForTrustline: (state, action: PayloadAction<string>) => {
      state.walletAddressForTrustline.privateKey = action.payload;
      state.walletAddressForTrustline.freighter = '';
      state.walletAddressForTrustline.trezor = {
        path: '',
        publicKey: '',
      };
      state.walletAddressForTrustline.ledger = {
        path: '',
        publicKey: '',
      };
    },
    setOpenWrongNetworkWarning: (state, action: PayloadAction<boolean>) => {
      state.openWrongNetworkWarning = action.payload;
    },
    setOpenStellarAccountIsNotActiveWarning: (state, action: PayloadAction<boolean>) => {
      state.openStellarAccountIsNotActiveWarning = action.payload;
    },
    setOpenAlreadyWhitelistDialog: (state, action: PayloadAction<boolean>) => {
      state.openAlreadyWhitelistDialog = action.payload;
    },
    setOpenTrustlineAndSubmitDialog: (state, action: PayloadAction<boolean>) => {
      state.openTrustlineAndSubmitDialog = action.payload;
    },
    setAssetsForTrustline: (state, action: PayloadAction<Array<Asset>>) => {
      state.assetsForTrustline = action.payload;
    },
    setOpenSuccessDialog: (state, action: PayloadAction<boolean>) => {
      state.openSuccessDialog = action.payload;
    },

    disconnectStellar: (state) => {
      state.freighter = '';
      state.trezor = {
        path: '',
        publicKey: '',
      };
      state.ledger = {
        path: '',
        publicKey: '',
      };
      state.privateKey = '';
    },
    disconnectAll: (state) => {
      state.bsc = '';
      state.freighter = '';
      state.trezor = {
        path: '',
        publicKey: '',
      };
      state.ledger = {
        path: '',
        publicKey: '',
      };
      state.privateKey = '';
    },
  },
});

export const {
  setBsc,
  setFreighter,
  setTrezor,
  setLedger,
  setPrivateKey,
  setOpenConnectDialog,
  setWhiteList,
  setOpenWarningModal,
  setWalletAddressForWhiteListing,
  setAddressIsUsedWarning,
  setInstallationRequestWarning,
  setFreighterAddressForTrustline,
  setTrezorAddressForTrustline,
  setLedgerAddressForTrustline,
  setPrivateKeyOfAddressForTrustline,
  setOpenWrongNetworkWarning,
  setOpenStellarAccountIsNotActiveWarning,
  setOpenAlreadyWhitelistDialog,
  setOpenTrustlineAndSubmitDialog,
  setAssetsForTrustline,
  setOpenSuccessDialog,
  disconnectStellar,
  disconnectAll,
} = walletSlice.actions;

const { reducer: walletReducer } = walletSlice;

export default walletReducer;
