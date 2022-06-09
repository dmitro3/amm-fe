import { createSlice } from '@reduxjs/toolkit';
import {
  deleteUserWallet,
  getListUserWallet,
  getUserWallet,
  updateUserWallet,
  createUserWallet,
  changePassword,
  getAllFunctionalCurrencies,
  updateFunCurrencies,
} from './apis';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loading: false,
    error: '',
    listUserWallet: { code: 0, data: [], metadata: { totalPage: 1 } },
    funCurrencies: [],
  },
  reducers: {
    addAddressWhitelist: (state, action) => {
      state.listUserWallet = {
        ...state.listUserWallet,
        data: action.payload,
      };
    },
  },
  extraReducers: {
    // get list
    [`${getListUserWallet.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getListUserWallet.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getListUserWallet.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listUserWallet = action.payload;
    },

    // get one
    [`${getUserWallet.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getUserWallet.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getUserWallet.fulfilled}`]: (state) => {
      state.loading = false;
    },

    // post
    [`${createUserWallet.pending}`]: (state) => {
      state.loading = true;
    },
    [`${createUserWallet.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${createUserWallet.fulfilled}`]: (state) => {
      state.loading = false;
    },

    // update
    [`${updateUserWallet.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateUserWallet.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${updateUserWallet.fulfilled}`]: (state) => {
      state.loading = false;
    },

    // delete
    [`${deleteUserWallet.pending}`]: (state) => {
      state.loading = true;
    },
    [`${deleteUserWallet.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${deleteUserWallet.fulfilled}`]: (state) => {
      state.loading = false;
    },

    //change password
    [`${changePassword.pending}`]: (state) => {
      state.loading = true;
    },
    [`${changePassword.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${changePassword.fulfilled}`]: (state) => {
      state.loading = false;
    },

    //get currencies
    [`${getAllFunctionalCurrencies.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getAllFunctionalCurrencies.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getAllFunctionalCurrencies.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.funCurrencies = action.payload.data;
    },

    // update fun currencies
    [`${updateFunCurrencies.pending}`]: (state) => {
      state.loading = true;
    },
    [`${updateFunCurrencies.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${updateFunCurrencies.fulfilled}`]: (state) => {
      state.loading = false;
    },
  },
});

export const { addAddressWhitelist } = userSlice.actions;

const { reducer: userReducer } = userSlice;

export default userReducer;
