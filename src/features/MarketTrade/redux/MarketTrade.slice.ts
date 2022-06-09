import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { MARKET_TRADE_DATA_LENGTH } from 'src/features/MarketTrade/constants/MarketTradeData';
import axiosInstance from 'src/services/config';
import { TradingMethod } from 'src/constants/dashboard';
import { combineTrades } from 'src/features/MarketTrade/helper';
import { Trade } from 'src/features/MarketTrade/interfaces/Trade';

const initialState: { stellar: Trade[]; bsc: Trade[]; combined: Trade[] } = {
  stellar: [],
  bsc: [],
  combined: [],
};
export const getStellarTradesApi = createAsyncThunk('/stellar/trades', async (pairId: number) => {
  return axiosInstance.get('/trades', { params: { pair_id: pairId, method: TradingMethod.StellarOrderbook } });
});
export const getBSCTradesApi = createAsyncThunk('/bsc/trades', async (pairId: number) => {
  return axiosInstance.get('/trades', { params: { pair_id: pairId, method: TradingMethod.BSCOrderbook } });
});

const marketTradeSlice = createSlice({
  name: 'getMarketTrade',
  initialState: initialState,
  reducers: {
    clearMarketTrade: (state) => {
      state.stellar = [];
      state.bsc = [];
      state.combined = [];
    },
    addNewTrades: (state, action) => {
      const method = action.payload[0].method;
      if (method === TradingMethod.StellarOrderbook) {
        state.stellar = action.payload.concat(state.stellar).slice(0, MARKET_TRADE_DATA_LENGTH);
      } else if (method === TradingMethod.BSCOrderbook) {
        state.bsc = action.payload.concat(state.bsc).slice(0, MARKET_TRADE_DATA_LENGTH);
      }
      state.combined = combineTrades(state.stellar, state.bsc);
    },
  },
  extraReducers: {
    [getStellarTradesApi.fulfilled.toString()]: (state, action) => {
      state.stellar = action.payload.data;
      state.combined = combineTrades(state.stellar, state.bsc);
    },
    [getBSCTradesApi.fulfilled.toString()]: (state, action) => {
      state.bsc = action.payload.data;
      state.combined = combineTrades(state.stellar, state.bsc);
    },
  },
});

const { reducer: marketTradeReducer } = marketTradeSlice;
export default marketTradeReducer;
export const { clearMarketTrade, addNewTrades } = marketTradeSlice.actions;
