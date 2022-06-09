/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';

const initialState = {
  coins: { data: [] },
};

export const getCoinsApi = createAsyncThunk('order/getCoins', async () => {
  return await axiosInstance.get(`/coins/list`);
});

const coinListSlice = createSlice({
  name: 'getCoinList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getCoinsApi.fulfilled.toString()]: (state, action) => {
      state.coins = action.payload;
    },
  },
});

const { actions, reducer: allCoinReducer } = coinListSlice;
export default allCoinReducer;
