import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialState {
  slippageTolerance: string;
  customSlippageTolerance: string;
  focusCustomSlippageTolerance: boolean;
}

const initialState: InitialState = {
  slippageTolerance: '',
  customSlippageTolerance: '',
  focusCustomSlippageTolerance: false,
};

const slippageToleranceSlice = createSlice({
  initialState,
  name: 'slippage tolerance',
  reducers: {
    setSlippageTolerance: (state, action: PayloadAction<string>) => {
      state.slippageTolerance = action.payload;
    },
    setCustomSlippageTolerance: (state, action: PayloadAction<string>) => {
      state.customSlippageTolerance = action.payload;
    },
    setFocusCustomSlippageTolerance: (state, action: PayloadAction<boolean>) => {
      state.focusCustomSlippageTolerance = action.payload;
    },
  },
});

export const { setSlippageTolerance, setCustomSlippageTolerance, setFocusCustomSlippageTolerance } =
  slippageToleranceSlice.actions;

const { reducer: slippageToleranceReducer } = slippageToleranceSlice;

export default slippageToleranceReducer;
