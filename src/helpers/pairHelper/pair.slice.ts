/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';

const initialState = {
  pairs: { data: [] },
};

export const getPairsApi = createAsyncThunk('order/getPairs', async () => {
  return await axiosInstance.get(`/pair/list`);
});

const pairListSlice = createSlice({
  name: 'getPairList',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getPairsApi.fulfilled.toString()]: (state, action) => {
      state.pairs = action.payload;
    },
  },
});

const { actions, reducer: allPairReducer } = pairListSlice;
export default allPairReducer;
