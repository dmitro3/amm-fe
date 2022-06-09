export interface HardwareWalletData {
  path: string;
  publicKey: string;
}
export interface BalanceStellar {
  asset_code: string;
  asset_issuer: string;
  asset_type: string;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
}
export interface CheckWhiteListActionPayload {
  isSelectedStellar?: boolean;
  isSelectedBsc?: boolean;
}
