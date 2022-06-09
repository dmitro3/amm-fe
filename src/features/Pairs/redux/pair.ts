/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pair, PairInfo, PairInfoResponse } from 'src/features/Pairs/interfaces/pair';
import axiosInstance from 'src/services/config';
import { convertPairInfo } from 'src/features/Pairs/helper';
interface InitialState {
  selectedPair?: Pair;
  pairs?: Array<Pair>;
  // selectedPairInfo?: PairInfo;
  pairInfos: Array<PairInfo>;
}

export const getPairs = createAsyncThunk('pair/list', async () => {
  const response = await axiosInstance.get('/pair/list').catch((error) => error);
  const pairsData = response.data;
  return {
    pairsData,
  };
});
export const getAllTraderTicker = createAsyncThunk('trades/getAllTradeTicker', async () => {
  const response = await axiosInstance.get('/ticker/24h').catch((error) => error);
  const tradeTicker = response.data;
  return tradeTicker;
});
const initialState: InitialState = {
  selectedPair: undefined,
  pairs: undefined,
  // selectedPairInfo: undefined,
  pairInfos: [],
};

export const pairSlice = createSlice({
  name: 'pair',
  initialState,
  reducers: {
    setSelectedPair: (state, action: PayloadAction<Pair>) => {
      state.selectedPair = action.payload;
    },
    setPairs: (state, action: PayloadAction<Array<Pair>>) => {
      state.pairs = action.payload;
    },
    // setSelectedPairInfo: (state, action: PayloadAction<PairInfo>) => {
    //   state.selectedPairInfo = action.payload;
    // },
    setPairInfos: (state, action: PayloadAction<Array<PairInfoResponse>>) => {
      const pairsInfo = (action.payload || []).map((item: PairInfoResponse) => convertPairInfo(item));
      state.pairInfos = pairsInfo;
      // if (!!pairsInfo.length && state.selectedPair) {
      //   const selectedPairInfo = pairsInfo.find(
      //     (pair: PairInfo) => pair.pair_id === state.selectedPair?.pairs_id,
      //   );
      //   if (selectedPairInfo) {
      //     state.selectedPairInfo = selectedPairInfo;
      //   }
      // }
    },
  },
  extraReducers: {
    [`${getPairs.pending}`]: (state) => {},
    [`${getPairs.rejected}`]: (state, action) => {},
    [`${getPairs.fulfilled}`]: (state, action) => {
      state.pairs = action.payload.pairsData;
      // if (action.payload.pairsData) {
      //   state.selectedPair = action.payload.pairsData[0];
      // }
    },
    [`${getAllTraderTicker.fulfilled}`]: (state, action) => {
      const pairsInfo = ((action.payload?.length && action.payload) || []).map((item: PairInfoResponse) =>
        convertPairInfo(item),
      );
      state.pairInfos = pairsInfo;
      // if (!!pairsInfo.length && state.selectedPair) {
      //   const selectedPairInfo = pairsInfo.find(
      //     (pair: PairInfo) => pair.pair_id === state.selectedPair?.pairs_id,
      //   );
      //   if (selectedPairInfo) {
      //     state.selectedPairInfo = selectedPairInfo;
      //   }
      // }
    },
  },
});

export const { setSelectedPair, setPairs, setPairInfos } = pairSlice.actions;

const { reducer: pairReducer } = pairSlice;

export default pairReducer;
