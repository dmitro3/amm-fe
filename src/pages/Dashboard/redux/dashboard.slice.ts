import { TradingFeeSetting } from 'src/interfaces/index';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tradingFeeSetting: TradingFeeSetting,
  tradingFeeStellarSetting: TradingFeeSetting,
};

const dashboardSlice = createSlice({
  name: 'getDashboard',
  initialState: initialState,
  reducers: {
    getTradingFeeSetting: (state, action) => {
      state.tradingFeeSetting = action.payload;
    },
    getTradingFeeStellarSetting: (state, action) => {
      state.tradingFeeStellarSetting = action.payload;
    },
  },
});

const { reducer: dashboardReducer } = dashboardSlice;
export default dashboardReducer;
export const { getTradingFeeSetting, getTradingFeeStellarSetting } = dashboardSlice.actions;
