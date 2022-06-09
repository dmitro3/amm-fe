import axiosInstance from 'src/services/config';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ICreatePool } from 'src/pages/PoolRequest/interfaces';
import { setSnackbarError } from 'src/services/admin';

interface ErrorResponse {
  code: string;
  message: string;
  path: string;
  status_code: number;
}

const initialState = {
  loading: false,
  data: '',
  metadata: {},
  error: {} as ErrorResponse,
};

export const postPoolRequest = createAsyncThunk('user/poolRequest', async (body: ICreatePool, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/pools/create`, body);
    return res;
  } catch (error) {
    setSnackbarError(error.response.data.message);
    return rejectWithValue(error.response.data);
  }
});

export const countPoolRequest = async (): Promise<number> => {
  try {
    const res = await axiosInstance.get('/pools/count');
    return res.data;
  } catch (error) {
    setSnackbarError(error.response.data.message);
    throw error;
  }
};

const poolRequestSlide = createSlice({
  name: 'poolRequest',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [postPoolRequest.pending.toString()]: (state) => {
      state.loading = true;
    },
    [postPoolRequest.rejected.toString()]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [postPoolRequest.fulfilled.toString()]: (state) => {
      state.loading = false;
    },
  },
});

const { reducer: poolRequestReducer } = poolRequestSlide;
export default poolRequestReducer;
