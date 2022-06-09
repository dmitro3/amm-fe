import { HardwareWalletData } from 'src/features/ConnectWallet/interfaces/HardwareWalletData';
import { SoftwareWalletType } from 'src/features/ConnectWallet/constants/uninstallExtensionException';
import { Asset } from 'stellar-sdk';

export interface DialogData {
  open: boolean;
  address: string;
}

export interface WalletData {
  bsc: string;
  freighter: string;
  trezor: HardwareWalletData;
  ledger: HardwareWalletData;
  privateKey: string;
  isWhiteList: boolean;
  isOpenWarningModal: boolean;
  openConnectDialog: boolean;
  walletAddressForWhiteListing: string;
  walletAddressForTrustline: {
    freighter: string;
    trezor: HardwareWalletData;
    ledger: HardwareWalletData;
    privateKey: string;
  };
  addressIsUsedWarning: DialogData;
  installationRequestWarning: {
    open: boolean;
    walletType: SoftwareWalletType;
  };
  openWrongNetworkWarning: boolean;
  openStellarAccountIsNotActiveWarning: boolean;
  openAlreadyWhitelistDialog: boolean;
  openTrustlineAndSubmitDialog: boolean;
  assetsForTrustline: Array<Asset>;
  openSuccessDialog: boolean;
}
