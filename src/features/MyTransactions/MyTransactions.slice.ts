/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';

const initialState = {
  openOrders: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  orderHistory: { data: [], metadata: { totalSize: 0, dataSize: 0, totalPage: 1 } },
  wallets: { data: [] },
  tradesOB: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  tradesLiq: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  loading: false,
  messageError: null,
  transactions: { data: [], metadata: { totalItem: 0, totalPage: 1 } },
  lastData: [],
  refreshOrder: false,
};

const ACTION = {
  GET_OPEN_ORDERS: 'order/getOpenOrders',
  GET_ORDER_HISTORY: 'order/getOrderHistory',
  GET_WALLETS: 'order/getWallets',
  CANCEL_ORDER: 'order/cancelOrder',
  GET_TRADES_OB: 'trade/getTradesOB',
  GET_TRADES_LIQ: 'trade/getTradesLIQ',
  INIT_TRADES_LIQ: 'trade/initTradesLIQ',
  GET_TRANSACTIONS_LIQ: 'trade/getTransactionsLiq',
  INIT_TRANSACTIONS_LIQ: 'trade/initTransactionsLiq',
};

export const getTransactionsApi = createAsyncThunk(ACTION.GET_TRANSACTIONS_LIQ, async (body: any) => {
  return axiosInstance.post('/trades/getTransactionLiq', body);
});

export const initTransactionsApi = createAsyncThunk(ACTION.INIT_TRANSACTIONS_LIQ, async (body: any) => {
  return axiosInstance.post('/trades/getTransactionLiq', body);
});

export const getOpenOrdersApi = createAsyncThunk(ACTION.GET_OPEN_ORDERS, async (body?: any) => {
  return await axiosInstance.get(`/order/list`, {
    params: body,
  });
});

export const getOrderHistoryApi = createAsyncThunk(ACTION.GET_ORDER_HISTORY, async (body?: any) => {
  return await axiosInstance.get(`/order/list`, {
    params: body,
  });
});

export const getTradesOBApi = createAsyncThunk(ACTION.GET_TRADES_OB, async (body?: any) => {
  return await axiosInstance.get(`/trades/list`, {
    params: body,
  });
});

export const getTradesLiqApi = createAsyncThunk(ACTION.GET_TRADES_LIQ, async (body?: any) => {
  return await axiosInstance.get(`/trades/list`, {
    params: body,
  });
});

export const initTradesLiqApi = createAsyncThunk(ACTION.INIT_TRADES_LIQ, async (body?: any) => {
  return await axiosInstance.get(`/trades/list`, {
    params: body,
  });
});

export const cancelOrderApi = createAsyncThunk(ACTION.CANCEL_ORDER, async (orderId: number) => {
  return await axiosInstance.put(`/order/${orderId}/cancel`);
});

const orderListSlice = createSlice({
  name: 'getOrderList',
  initialState: initialState,
  reducers: {
    refreshOpenOrder: (state, action: PayloadAction<boolean>) => {
      state.refreshOrder = action.payload;
    },
  },
  extraReducers: {
    [getOpenOrdersApi.pending.toString()]: (state) => {
      state.loading = true;
    },
    [getOpenOrdersApi.rejected.toString()]: (state) => {
      state.loading = false;
    },
    [getOpenOrdersApi.fulfilled.toString()]: (state, action) => {
      state.loading = false;
      state.openOrders = action.payload;
    },
    [getOrderHistoryApi.pending.toString()]: (state) => {
      state.loading = true;
    },
    [getOrderHistoryApi.rejected.toString()]: (state) => {
      state.loading = false;
    },
    [getOrderHistoryApi.fulfilled.toString()]: (state, action) => {
      state.loading = false;
      state.orderHistory = action.payload;
    },
    [cancelOrderApi.rejected.toString()]: (state, action) => {},
    [cancelOrderApi.fulfilled.toString()]: (state, action) => {},
    [getTradesOBApi.fulfilled.toString()]: (state, action) => {
      state.tradesOB = action.payload;
    },
    [initTradesLiqApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.tradesLiq = action.payload;
    },
    [getTradesLiqApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.tradesLiq = action.payload.data
        ? {
            ...action.payload,
            data: Array.from(new Set([...state.tradesLiq.data, ...action.payload.data])).sort(
              (a, b) => b.trade_id - a.trade_id,
            ),
          }
        : action.payload;
    },
    [initTransactionsApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.transactions = action.payload;
    },
    [getTransactionsApi.fulfilled.toString()]: (state, action) => {
      state.lastData = action.payload.data;
      state.transactions = action.payload.data
        ? {
            ...action.payload,
            data: [...state.transactions.data, ...action.payload.data],
          }
        : action.payload;
    },
  },
});

export const { refreshOpenOrder } = orderListSlice.actions;
const { reducer: orderReducer } = orderListSlice;
export default orderReducer;
