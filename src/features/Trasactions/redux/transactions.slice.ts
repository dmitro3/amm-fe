import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { LENGTH_TRANSACTION } from 'src/features/Trasactions/constants/displayMode';

const initialState = {
  transactions: [],
};
const requestUrl = process.env.REACT_APP_SUBGRAPH || '';
export const getTransactionsApi = createAsyncThunk('/transaction', async (query: any) => {
  return axios.post(requestUrl, query);
});

const transactionsSlice = createSlice({
  name: 'getTransactions',
  initialState: initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = [];
    },
    addPoolTransactions: (state, action) => {
      state.transactions = action.payload.concat(state.transactions).slice(0, LENGTH_TRANSACTION);
    },
  },
  extraReducers: {
    [getTransactionsApi.fulfilled.toString()]: (state, action) => {
      state.transactions = action.payload.data?.data?.swaps || [];
    },
  },
});

const { reducer: transactionsReducer } = transactionsSlice;
export default transactionsReducer;
export const { clearTransactions, addPoolTransactions } = transactionsSlice.actions;
