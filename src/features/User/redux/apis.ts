import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import store from 'src/store/store';

export const getMe = createAsyncThunk('user/getMe', async () => {
  return {
    userId: 0,
    name: 'Admin',
  };
});

export const getListUserWallet = createAsyncThunk('user/getListUserWallet', async (body: any) => {
  return axiosInstance.get(`/wallet/list`, {
    params: body,
  });
});

export const getUserWallet = createAsyncThunk('user/getUserWallet', async (id: number) => {
  return axiosInstance.get(`${process.env.REACT_APP_BASE_URL_LOCAL}wallet/${id}`);
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export const createUserWallet = createAsyncThunk('user/createUserWallet', async (body: any) => {
  try {
    const res = await axiosInstance.post(`/wallet/user-create`, body);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const updateUserWallet = createAsyncThunk('user/updateUserWallet', async (body: any) => {
  return axiosInstance.put(`/wallet`, body);
});

export const deleteUserWallet = createAsyncThunk('user/deleteUserWallet', async (id: number) => {
  return axiosInstance.delete(`/wallet/${id}`);
});

export const changePassword = createAsyncThunk('user/change-password', async (body: any) => {
  try {
    const res = await axiosInstance.put(`/users/change-password`, body);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const getAllFunctionalCurrencies = createAsyncThunk('functional-currency', async () => {
  return axiosInstance.get(`/functional-currency`);
});

export const updateFunCurrencies = createAsyncThunk('update-list-fun-currencies', async (body: any) => {
  try {
    const res: any = await axiosInstance.post(`/users/update-list-fun-currencies`, body);
    if (res?.code === 0) {
      store.dispatch(
        openSnackbar({
          message: 'Functional currency has been updated successfully!',
          variant: SnackbarVariant.SUCCESS,
        }),
      );
    }
    return res;
  } catch (err) {
    throw err;
  }
});

//
export const putVolatilitySource = createAsyncThunk('/update-volatility-source', async (body: any) => {
  try {
    const res = await axiosInstance.put(`/users/volatility/${body}`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const putIntervalDuration = createAsyncThunk('/update-interval-duration', async (body: any) => {
  try {
    const res = await axiosInstance.put(`/users/confidence/${body}`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const getVolatilitySource = createAsyncThunk('/get-volatility', async () => {
  try {
    const res = await axiosInstance.get(`/users/volatility`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const getIntervalDuration = createAsyncThunk('/get-interval', async () => {
  try {
    const res = await axiosInstance.get(`/users/confidence`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const checkWalletAddressNetwork = createAsyncThunk('/check-wallet-address-network', async (address: string) => {
  try {
    const res = await axiosInstance.get(`/users/check-wallet-address-network/${address}`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const checkWalletAddressExists = createAsyncThunk('/check-wallet-address-exists', async (address: string) => {
  try {
    const res = await axiosInstance.get(`/users/check-wallet-address-exists/${address}`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const checkWalletStellarAddressActive = createAsyncThunk(
  'check-wallet-stellar-active',
  async (address: string) => {
    try {
      const res = await axiosInstance.get(`/users/check-wallet-stellar-address-active/${address}`);
      return res;
    } catch (err) {
      return err.response.data;
    }
  },
);

export const checkWalletStellarTrustline = createAsyncThunk(
  'check-wallet-stellar-trustline',
  async (address: string) => {
    try {
      const res = await axiosInstance.get(`/users/check-wallet-address-trustline/${address}`);
      return res;
    } catch (err) {
      return err.response.data;
    }
  },
);
