import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { FunctionCurrency } from 'src/interfaces/user';
import { setSnackbarError } from 'src/services/admin';
import axiosInstance from 'src/services/config';

interface InitialState {
  functionalCurrencies: { data: Array<FunctionCurrency> };
  exchangeRates: ExchangeRate[];
  veloValuePerUsd: number;
}

export const getFunctionalCurrencies = createAsyncThunk('functional-currency', async () => {
  const response = await axiosInstance.get('/functional-currency');
  return response;
});

export const getExchangeRates = createAsyncThunk('getExchangeRates', async () => {
  return await axiosInstance.get('/misc/exchange-rates');
});

export const getVeloValuePerUsd = createAsyncThunk('getVeloValuePerUsd', async () => {
  try {
    const response = await axiosInstance.get('/misc/exchange-velo');
    return response.data[0] as ExchangeRate;
  } catch (error) {
    setSnackbarError(error.response.data.message);
    throw error;
  }
});

const initialState: InitialState = {
  functionalCurrencies: { data: [] },
  exchangeRates: [],
  veloValuePerUsd: 0.503,
};

export const functionalCurrencySlice = createSlice({
  name: 'functionalCurrency',
  initialState,
  reducers: {
    setFunctionalCurrencies: (state, action) => {
      state.functionalCurrencies = action.payload;
    },
  },
  extraReducers: {
    [`${getFunctionalCurrencies.fulfilled}`]: (state, action) => {
      state.functionalCurrencies = action.payload;
      // if (action.payload.data?.length > 0) {
      //   state.selectedFunctionalCurrencyId = action.payload.data[0].id;
      // }
    },
    [`${getExchangeRates.fulfilled}`]: (state, action) => {
      state.exchangeRates = action.payload.data;
    },

    [`${getVeloValuePerUsd.fulfilled}`]: (state, action: PayloadAction<ExchangeRate>) => {
      state.veloValuePerUsd = action.payload.rate;
    },
  },
});

export const { setFunctionalCurrencies } = functionalCurrencySlice.actions;

const { reducer: functionalCurrencyReducer } = functionalCurrencySlice;

export default functionalCurrencyReducer;
