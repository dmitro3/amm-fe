export interface RegisterInfo {
  title: string;
  fullname: string;
  company: string;
  position: string;
  email: string;
  password: string;
  regionCode: string;
  phone: string;
  functional_currencies: number[];
  wallets: string[];
  velo_account?: string;
}

export interface LogInBody {
  username: string;
  password: string;
  isVerify: string;
}
