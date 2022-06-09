export interface IUserInfo {
  access_token: string;
  refresh_token: string;
  id: number;
  email: string;
  company: string;
  fullname: string;
  phone: string;
  velo_account: string;
  role: number;
  created_at: Date;
  listUserFunCurrencies: Array<IUserFunCurrencies>;
  last_login: Date;
  IP: string;
  selectedFunctionalCurrencyId?: number;
}
export interface IOptionSelect {
  isActive?: number;
  value: number;
  label: string;
}

export interface IUserFunCurrencies {
  users_id: number;
  functional_currencies_id: number;
  functional_currencies_currency: string;
  functional_currencies_symbol: string;
  functional_currencies_iso_code: string;
  is_active: number;
}

export interface IFunCurrency {
  id: number;
  currency: string;
  symbol: string;
  iso_code: string;
  digital_credits: string;
  fractional_unit: string;
  number_basic: number;
}
