import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserFunCurrencies, IUserInfo } from 'src/features/User/Account/Account.interface';
import axiosInstance from 'src/services/config';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import store from 'src/store/store';
import { RegisterInfo, LogInBody } from 'src/interfaces/auth';
import { setTokenCookie } from 'src/helpers/storage';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';
import { BaseSocket } from 'src/socket/BaseSocket';

export const FunCurrencies = {
  seconds: 1,
  primary: 2,
};

const setSnackbarSuccess = (message: string) => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.SUCCESS,
    }),
  );
};

const setSnackbarError = (message: string) => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.ERROR,
    }),
  );
};

export const createUser = createAsyncThunk('user/create', async (body: RegisterInfo, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/users', body);

    return res;
  } catch (err) {
    if (
      err.response.status_code !== 406 &&
      err.response.code !== httpExceptionSubCode.NOT_ACCEPTABLE.WALLET_ADDRESS_USED
    ) {
    } else setSnackbarError(err.response.data.message);

    return rejectWithValue(err.response.data);
  }
});

export const verifyEmail = createAsyncThunk('auth/verify-email', async (token: string, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/auth/verify-email?token=${token}`);
    return res;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const resendVerifyEmail = createAsyncThunk(
  'user/resend-verify-email',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/users/resend-verify-email/${email}`);
      return res;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      return rejectWithValue(err.response.data);
    }
  },
);

export const getMe = createAsyncThunk('get-profile', async () => {
  return await axiosInstance.get(`/users/me`);
});

export const postLogin = createAsyncThunk('user/postLogin', async (body: LogInBody, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/auth/login', body);

    return res;
  } catch (err) {
    if (err.response.data?.status_code === 403) {
      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_NOT_ACTIVE)
        setSnackbarError(`Your account is pending for approval by the Velo Lab’s Admin team. 
    An email will be sent to notify you once the approval process is complete.`);

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.ACCOUNT_LOCKED)
        setSnackbarError('Your account have been locked!');

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.WRONG_PASS)
        setSnackbarError(err.response.data?.message);

      if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.WRONG_EMAIL)
        setSnackbarError('Wrong email or password!');
    }

    return rejectWithValue(err.response.data);
  }
});

export const forgotPassword = createAsyncThunk(
  'user/forgot-password',
  async (body: { email: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('users/forgot-password', body);
      setSnackbarSuccess('Reset password verification code has been sent to your email.');

      return res;
    } catch (err) {
      if (err.response.data?.status_code === 403) {
        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_EMAIL_NOT_VERIFIED)
          setSnackbarError('Please verify your account!');

        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_NOT_ACTIVE) {
          setSnackbarError(`Your account is pending for approval by the Velo Lab’s Admin team. 
          An email will be sent to notify you once the approval process is complete.`);
        }

        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.ACCOUNT_LOCKED) {
          setSnackbarError(`Email does not exist!`);
        }

        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.WRONG_EMAIL)
          setSnackbarError(`Email does not exist!`);

        if (err.response.data?.code === httpExceptionSubCode.FORBIDDEN.ADMIN_NOT_CHANGED_DEFAULT_PASSWORD) {
          setSnackbarError(`Please use email and password provided by super admin to sign in.`);
        }
      }

      return rejectWithValue(err.response.data);
    }
  },
);

export const checkPassToken = createAsyncThunk(
  'user/check-password-token',
  async (body: { email: string; token: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('users/check-pass-token', body);
      setSnackbarSuccess('Your verification code is correct! Please reset your password.');

      return res;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  },
);

export const changePassword = createAsyncThunk(
  'user/reset-password',
  async (body: { email: string; token: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put('users/reset-password', body);
      setSnackbarSuccess('Password has been reset successfully.');

      return res;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  },
);

export const getListIntervalSetting = createAsyncThunk('get-list-interval-setting', async (body: any) => {
  try {
    const res = await axiosInstance.get(`/users/get-general`, body);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const putVolatilitySource = createAsyncThunk('/update-volatility-source', async (volatility: number) => {
  try {
    const res = await axiosInstance.put(`/users/volatility/${volatility}`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const getVolatilitySource = createAsyncThunk('/get-volatility', async () => {
  try {
    const res = await axiosInstance.get(`/users/volatility`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const putIntervalDuration = createAsyncThunk(
  '/update-interval-duration',
  async (body: { interval: number; type_convert: string }) => {
    try {
      const res = await axiosInstance.put(`/users/confidence`, body);
      return res;
    } catch (err) {
      return err.response.data;
    }
  },
);

export const getIntervalDuration = createAsyncThunk('/get-interval', async () => {
  try {
    const res = await axiosInstance.get(`/users/confidence`);
    return res;
  } catch (err) {
    return err.response.data;
  }
});

export const deleteFunCurrency = createAsyncThunk('/delete-funCurrency', async (id: number) => {
  try {
    const res = await axiosInstance.delete(`users/delete-fun-currency/${id}`);
    return res;
  } catch (err) {
    throw err;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: <IUserInfo>{},
    error: '',
    loading: false,
    tokenResetPassword: '',
    listIntervalSetting: { code: 0, data: [] as any[], metadata: { totalPage: 1 } },
    volatility_interval: {},
    confidence_interval: {},
  },
  reducers: {
    authLogout: (state, action) => {
      state.currentUser = action.payload;
    },
    setSelectedFunctionalCurrencyId: (state, action: PayloadAction<number>) => {
      state.currentUser.selectedFunctionalCurrencyId = action.payload;
    },
  },
  extraReducers: {
    // post login
    [`${postLogin.pending}`]: (state) => {
      state.loading = true;
    },
    [`${postLogin.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${postLogin.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.currentUser = {
        ...action.payload.data,
        selectedFunctionalCurrencyId: action.payload.data.listUserFunCurrencies.filter(
          (e: IUserFunCurrencies) => e.is_active === FunCurrencies.primary,
        )[0].functional_currencies_id,
      };
      setTokenCookie(action.payload.data.access_token, action.payload.data.refresh_token);
      BaseSocket.getInstance().reconnect();
    },

    [`${getMe.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getMe.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getMe.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.currentUser = {
        ...action.payload.data,
        selectedFunctionalCurrencyId: action.payload.data?.listUserFunCurrencies.filter(
          (e: IUserFunCurrencies) => e.is_active === FunCurrencies.primary,
        )[0]?.functional_currencies_id,
      };
    },

    // forgot password
    [`${forgotPassword.pending}`]: (state) => {
      state.loading = true;
    },
    [`${forgotPassword.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${forgotPassword.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.tokenResetPassword = action.payload;
    },

    //check password token
    [`${checkPassToken.pending}`]: (state) => {
      state.loading = true;
    },
    [`${checkPassToken.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${checkPassToken.fulfilled}`]: (state) => {
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

    //verify email
    [`${verifyEmail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${verifyEmail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${verifyEmail.fulfilled}`]: (state) => {
      state.loading = false;
    },

    //resend verify email
    [`${resendVerifyEmail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${resendVerifyEmail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${resendVerifyEmail.fulfilled}`]: (state) => {
      state.loading = false;
    },

    // get list interval settings
    [`${getListIntervalSetting.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getListIntervalSetting.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getListIntervalSetting.fulfilled}`]: (state, action) => {
      state.listIntervalSetting = action.payload;
      state.loading = false;
    },

    // get interval volatility
    [`${getVolatilitySource.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getVolatilitySource.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getVolatilitySource.fulfilled}`]: (state, action) => {
      state.volatility_interval = action.payload;
      state.loading = false;
    },

    // get interval confidence
    [`${getIntervalDuration.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getIntervalDuration.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.error;
    },
    [`${getIntervalDuration.fulfilled}`]: (state, action) => {
      state.confidence_interval = action.payload;
      state.loading = false;
    },
  },
});

export const { authLogout, setSelectedFunctionalCurrencyId } = authSlice.actions;

const { reducer: authReducer } = authSlice;

export default authReducer;
