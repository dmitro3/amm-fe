import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { TradingMethod } from 'src/constants/dashboard';
import { applyBscUpdates, combineOrderbook } from 'src/features/Orderbook/helpers/orderbookHelper';
import { Orderbook, OrderbookRow, OrderbookUpdates } from 'src/features/Orderbook/interfaces/orderbook';
import { params } from 'src/interfaces/StellarData';
import axiosInstance from 'src/services/config';

const defaultBscOrderbookState: {
  orderbook: Orderbook;
  isReady: boolean;
  pendingUpdates: OrderbookUpdates[];
} = {
  orderbook: { bids: [], asks: [], updated_at: 0 },
  isReady: false,
  pendingUpdates: [],
};

const defaultStellarOrderbookState: { orderbook: Orderbook } = {
  orderbook: { bids: [], asks: [] },
};

const initialState = {
  stellar: defaultStellarOrderbookState,
  bsc: defaultBscOrderbookState,
  combined: defaultStellarOrderbookState,
};
const requestUrl = `${process.env.REACT_APP_HORIZON}order_book`;
export const getStellarOrderbook = createAsyncThunk('stellar/orderbook', async (params: params) => {
  const response = await axiosInstance.get(requestUrl, { params }).catch((error) => error);
  return response;
});

export const getBscOrderbook = createAsyncThunk('bsc/orderbook', async (params: { pair_id: number }) => {
  const response = await axiosInstance.get('orderbook', { params }).catch((error) => error);
  return response.data;
});

const orderbookSlice = createSlice({
  name: 'getOrderBook',
  initialState: initialState,
  reducers: {
    clearOrderbook: (state) => {
      state.stellar = { ...defaultStellarOrderbookState };
      state.bsc = { ...defaultBscOrderbookState };
      state.combined = { ...defaultStellarOrderbookState };
    },
    clearBscOrderbook: (state) => {
      state.bsc = { ...defaultBscOrderbookState };
      state.combined.orderbook = combineOrderbook(state.stellar.orderbook, state.bsc.orderbook);
    },
    updateBscOrderbook: (state, action) => {
      if (state.bsc.isReady) {
        const bscOrderbook = { ...state.bsc.orderbook } as Orderbook;
        applyBscUpdates(bscOrderbook, action.payload);
        state.bsc.orderbook = bscOrderbook;
        state.combined.orderbook = combineOrderbook(state.stellar.orderbook, state.bsc.orderbook);
      } else {
        state.bsc.pendingUpdates = [...state.bsc.pendingUpdates, action.payload];
      }
    },
  },
  extraReducers: {
    [getStellarOrderbook.fulfilled.toString()]: (state, action) => {
      const stellarOrderbook = action.payload;
      stellarOrderbook.bids = stellarOrderbook.bids.map((row: OrderbookRow) => ({
        price: row.price,
        amount: new BigNumber(row.amount).div(row.price).toString(),
        method: TradingMethod.StellarOrderbook,
      }));
      // eslint-disable-next-line
      stellarOrderbook.asks = stellarOrderbook.asks.map((row: any) => ({
        ...row,
        method: TradingMethod.StellarOrderbook,
      }));
      state.stellar.orderbook = stellarOrderbook;
      state.combined.orderbook = combineOrderbook(state.stellar.orderbook, state.bsc.orderbook);
    },
    [getBscOrderbook.fulfilled.toString()]: (state, action) => {
      const orderbook: Orderbook = action.payload;
      orderbook.bids = orderbook.bids.map((row) => ({ ...row, method: TradingMethod.BSCOrderbook }));
      orderbook.asks = orderbook.asks.map((row) => ({ ...row, method: TradingMethod.BSCOrderbook }));
      for (const pendingUpdate of state.bsc.pendingUpdates) {
        applyBscUpdates(orderbook, pendingUpdate);
      }
      state.bsc = {
        orderbook,
        isReady: true,
        pendingUpdates: [],
      };
      state.combined.orderbook = combineOrderbook(state.stellar.orderbook, state.bsc.orderbook);
    },
  },
});

const { reducer: orderBookStellarReducer } = orderbookSlice;
export default orderBookStellarReducer;
export const { clearOrderbook, clearBscOrderbook, updateBscOrderbook } = orderbookSlice.actions;
