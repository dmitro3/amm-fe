import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
};

export const accountDiabledSlice = createSlice({
  name: 'accountDisabled',
  initialState,
  reducers: {
    accountDisabled: (state) => {
      return {
        ...state,
        open: true,
      };
    },
    accountDisabledClose: () => initialState,
  },
});

export const { accountDisabled, accountDisabledClose } = accountDiabledSlice.actions;

const { reducer: accountDiabledSliceReducer } = accountDiabledSlice;

export default accountDiabledSliceReducer;
