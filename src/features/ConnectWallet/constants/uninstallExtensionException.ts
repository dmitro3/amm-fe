export enum SoftwareWalletType {
  FREIGHTER = 'Freighter',
  METAMASK = 'MetaMask',
}

export const MISSING_EXTENSION_ERROR = 'Missing Extension';

export interface UninstallExtensionException {
  walletType: SoftwareWalletType;
  message: string;
}
