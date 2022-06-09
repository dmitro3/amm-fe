import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';

export interface TrustLineParam {
  symbol: string;
  issuer: string;
  assetType: number;
  hardwareWalletType: HardwareWalletType | null;
  path: string | null;
  publicKey: string | null;
  secret: string | null;
  isTrust?: boolean;
  isLoading?: boolean;
}
