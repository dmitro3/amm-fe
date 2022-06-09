export interface RegisterInfo {
  title: string;
  fullname: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  password: string;
  functionalCurrency: Array<string | number>;
  wallets: Array<string>;
  veloAccount?: string;
}
export interface RegisterInfoError {
  title?: FormError;
  fullName?: FormError;
  company?: FormError;
  position?: FormError;
  email?: FormError;
  phoneNumber?: FormError;
  password?: FormError;
  confirmPassword?: FormError;
  functionalCurrency?: FormError;
  walletAddress?: FormError;
  veloDashboardAccount?: FormError;
}

export interface ChangePasswordInfoError {
  currentPassword?: FormError;
  newPassword?: FormError;
  confirmPassword?: FormError;
}

export interface SignInError {
  email?: FormError;
  password?: FormError;
}
export interface ForgotPasswordError {
  email: FormError;
}
export interface FormError {
  isDirty?: boolean;
  text?: string;
}

export interface FunctionCurrency {
  id: number;
  symbol: string;
  number_basic: number;
  iso_code: string;
  fractional_unit: string;
  digital_credits: string;
  currency: string;
}
export interface SelectItem {
  key: number | string;
  value: any;
  text: string;
}

export interface DBCoin {
  id: number;
  name: string;
  symbol: string;
  stellar_issuer: string;
  bsc_addresss: string;
  decimal: number;
  type: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StellarBalance {
  balance: string;
  limit: string;
  buying_liabilities: string;
  selling_liabilities: string;
  last_modified_ledger: number;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
  asset_type: string;
  asset_code: string;
  asset_issuer: string;
}
