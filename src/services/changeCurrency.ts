import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from 'src/services/config';
const API_EXCHANE_CURRENCIES = 'https://xecdapi.xe.com/v1/convert_to.json/';
const API_EXCHANE_COIN = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

export const getCurrenies = (body: { from: string; to: string[]; amount: number }): Promise<any> => {
  return axios.get(`${API_EXCHANE_CURRENCIES}?to=${body.from}&from=${body.to.join(',')}&amount=${body.amount}`, {
    auth: {
      username: process.env.REACT_APP_XE_ACCOUNT_ID || '',
      password: process.env.REACT_APP_XE_API_KEY || '',
    },
  });
};

export const getCoinCrypto = (
  params: {
    start: number;
    limit: number;
    convert: string;
  } = { start: 1, limit: 10, convert: 'USD' },
): Promise<any> => {
  return axios.get(
    // eslint-disable-next-line max-len
    `${API_EXCHANE_COIN}?start=${params.start}&limit=${params.limit}&convert=${params.convert}`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.REACT_APP_COINMARKETCAP,
      },
    },
  );
};

export const getCurreniesApi = createAsyncThunk('app/get-all-currencies', async () => {
  return axiosInstance.get(`/misc/xe-currencies`);
});
