import { FunctionCurrency, RegisterInfo } from 'src/interfaces/user';
import axiosInstance from './config';

export const register = async (user: RegisterInfo): Promise<any> => {
  const res = await axiosInstance
    .post('/users', user)
    .catch((error) => error)
    .then((res) => res);
  return res;
};

export const getFunctionalCurrency = async (): Promise<Array<FunctionCurrency>> => {
  const res = await axiosInstance
    .get('functional-currency')
    .catch((error) => error)
    .then((res) => res && res.data);
  return res;
};

export const checkValidEmail = async (email: string): Promise<any> => {
  try {
    const res = await axiosInstance.post('users/check-valid-email', { email });
    return res;
  } catch (err) {
    return err.response.data;
  }
};

export const getRegionCode = async (): Promise<string> => {
  const res = await axiosInstance
    .get('location/region-code')
    .catch((error) => error)
    .then((res) => res);
  return res.data;
};

export const signin = async (email: string, password: string): Promise<any> => {
  const res = await axiosInstance
    .post('', {
      email: email,
      password: password,
    })
    .catch((error) => error)
    .then((res) => res);
  return res;
};

export const forgotPassword = async (email: string): Promise<any> => {
  const res = await axiosInstance
    .post('users/forgot-password', { email: email })
    .catch((error) => error)
    .then((res) => res);
  return res;
};

export const checkPassToken = async (email: string, token: string): Promise<any> => {
  const res = await axiosInstance
    .post('users/check-pass-token', { email: email, token: token })
    .catch((error) => error)
    .then((res) => res);
  return res;
};

export const resetPassword = async (email: string, token: string, password: string): Promise<any> => {
  const res = await axiosInstance
    .put('users/reset-password', {
      email: email,
      token: token,
      password: password,
    })
    .catch((error) => error)
    .then((res) => res);
  return res;
};

export const checkWalletAddressNetwork = async (address: string): Promise<any> => {
  try {
    const res = await axiosInstance.get(`users/check-wallet-address-network/${address}`);
    return res;
  } catch (error) {
    return error.response.data;
  }
};

export const isWalletAddressExists = async (address: string): Promise<boolean> => {
  try {
    const res = await axiosInstance.get(`users/check-wallet-address-exists/${address}`);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const isWalletStellarAddressActive = async (address: string): Promise<boolean> => {
  try {
    const res = await axiosInstance.get(`users/check-wallet-stellar-address-active/${address}`);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};

export const isWalletAddressTrustline = async (address: string): Promise<boolean> => {
  try {
    const res = await axiosInstance.get(`users/check-wallet-address-trustline/${address}`);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
};
