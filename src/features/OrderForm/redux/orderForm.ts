/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { TradingNetwork } from 'src/features/OrderForm/constants/tradingNetwork';
import { CheckNetworkData } from 'src/features/OrderForm/interfaces/checkNetworkData';
import { getFee } from 'src/features/OrderForm/services';
import { ORDER_TYPE } from 'src/features/User/Account/TradeHistory/Constant/Order';

export const fetchFee = createAsyncThunk('orderForm/fetchFee', async () => {
  const feeData = await getFee();
  const stellarFeeData = feeData.find((data: any) => {
    return data.name === TradingNetwork.STELLAR;
  });
  const bscFeeData = feeData.find((data: any) => {
    return data.name === TradingNetwork.BSC;
  });

  return {
    bscLimitOrder: bscFeeData.limit_order,
    bscMarketOrder: bscFeeData.market_order,
    stellarLimitOrder: stellarFeeData.limit_order,
    stellarMarketOrder: stellarFeeData.market_order,
  };
});

interface InitialState {
  tradingFee: {
    stellarMarketOrder: string;
    bscMarketOrder: string;
    stellarLimitOrder: string;
    bscLimitOrder: string;
  };
  cancelStellarOrder: {
    open: boolean;
    isCanceling: boolean;
    orderId: string;
    stellarOfferId: string;
  };
  wrongNetworkWarning2: {
    open: boolean;
    checkNetworkData: CheckNetworkData;
  };
  openOrderCannotBeExecutedWarning: boolean;
  sorType: SORType;
  openWrongFreighterAccountWarning: boolean;
}

const initialState: InitialState = {
  tradingFee: {
    bscLimitOrder: '-1',
    bscMarketOrder: '-1',
    stellarLimitOrder: '-1',
    stellarMarketOrder: '-1',
  },
  cancelStellarOrder: {
    open: false,
    isCanceling: false,
    orderId: '0',
    stellarOfferId: '0',
  },
  wrongNetworkWarning2: {
    open: false,
    checkNetworkData: {
      isOnTheSameNetwork: false,
      message: '',
    },
  },
  openOrderCannotBeExecutedWarning: false,
  sorType: SORType.MARKET_SOR,
  openWrongFreighterAccountWarning: false,
};

const orderFormSlice = createSlice({
  name: 'orderForm',
  initialState,
  reducers: {
    // set fee
    setFee: (state, action: PayloadAction<{ fee: string; tradingNetwork: TradingNetwork; orderType: string }>) => {
      const tradingNetwork = action.payload.tradingNetwork;
      const orderType = action.payload.orderType;
      const fee = action.payload.fee;

      if (tradingNetwork === TradingNetwork.BSC) {
        if (orderType === ORDER_TYPE.LIMIT) {
          state.tradingFee.bscLimitOrder = fee;
        } else if (orderType === ORDER_TYPE.MARKET) {
          state.tradingFee.bscMarketOrder = fee;
        }
      } else if (tradingNetwork == TradingNetwork.STELLAR) {
        if (orderType === ORDER_TYPE.LIMIT) {
          state.tradingFee.stellarLimitOrder = fee;
        } else if (orderType === ORDER_TYPE.MARKET) {
          state.tradingFee.stellarMarketOrder = fee;
        }
      }
    },

    // Cancel Stellar Order
    setOpenCancelStellarOrder: (state, action: PayloadAction<boolean>) => {
      state.cancelStellarOrder.open = action.payload;
    },
    setIsCanceling: (state, action: PayloadAction<boolean>) => {
      state.cancelStellarOrder.isCanceling = action.payload;
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.cancelStellarOrder.orderId = action.payload;
    },
    setStellarOfferId: (state, action: PayloadAction<string>) => {
      state.cancelStellarOrder.stellarOfferId = action.payload;
    },

    // Wrong Network Warning Dialog
    setOpenWrongNetworkWarning2: (state, action: PayloadAction<boolean>) => {
      state.wrongNetworkWarning2.open = action.payload;
    },
    setCheckNetworkData: (state, action: PayloadAction<CheckNetworkData>) => {
      state.wrongNetworkWarning2.checkNetworkData = action.payload;
    },

    // Open Order Cannot Be Executed Warning
    setOpenOrderCannotBeExecutedWarning: (state, action: PayloadAction<boolean>) => {
      state.openOrderCannotBeExecutedWarning = action.payload;
    },

    // SOR type
    setSORType: (state, action: PayloadAction<SORType>) => {
      state.sorType = action.payload;
    },

    setOpenWrongFreighterAccountWarning: (state, action: PayloadAction<boolean>) => {
      state.openWrongFreighterAccountWarning = action.payload;
    },
  },

  extraReducers: {
    [`${fetchFee.pending}`]: (state) => {},
    [`${fetchFee.rejected}`]: (state, action) => {
      state.tradingFee = initialState.tradingFee;
    },
    [`${fetchFee.fulfilled}`]: (state, action) => {
      state.tradingFee = action.payload;
    },
  },
});

export const {
  setFee,
  setOpenCancelStellarOrder,
  setIsCanceling,
  setOrderId,
  setStellarOfferId,
  setOpenWrongNetworkWarning2,
  setCheckNetworkData,
  setOpenOrderCannotBeExecutedWarning,
  setSORType,
  setOpenWrongFreighterAccountWarning,
} = orderFormSlice.actions;

const { reducer: orderFormReducer } = orderFormSlice;

export default orderFormReducer;
