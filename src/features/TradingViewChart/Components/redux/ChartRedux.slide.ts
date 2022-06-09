import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  isShowTradingView: true,
  isFullScreen: false,
};
const chartSlide = createSlice({
  name: 'getChartState',
  initialState: initialState,
  reducers: {
    isShowTradingChart: (state: any, action: any) => {
      state.isShowTradingView = action.payload;
    },
    isFullScreen: (state: any, action: any) => {
      state.isFullScreen = action.payload;
    },
  },
});
const { reducer: chartReducer } = chartSlide;
export default chartReducer;
export const { isShowTradingChart, isFullScreen } = chartSlide.actions;
