import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SnackbarVariant {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}
export type SnackbarState = {
  message: string;
  variant: string;
  isOpen: boolean;
};

const initialState: SnackbarState = {
  message: '',
  variant: '',
  isOpen: false,
};

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    openSnackbar: (state, action: PayloadAction<{ message: string; variant: SnackbarVariant }>) => ({
      ...state,
      message: action.payload.message,
      variant: action.payload.variant,
      isOpen: true,
    }),
    closeSnackbar: () => initialState,
  },
});

export const { openSnackbar, closeSnackbar } = snackbarSlice.actions;

const { reducer: snackbarReducer } = snackbarSlice;

export default snackbarReducer;
