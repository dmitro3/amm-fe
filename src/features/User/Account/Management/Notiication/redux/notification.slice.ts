import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  countNotificationNotRead,
  getListNotifications,
  getListNotificationsPopup,
  getListNotificationsSystem,
  getPoolCreatedNotificationDetail,
  getPoolRequestNotificationDetail,
  initListNotificationsPopup,
} from './apis';
import { INotification, PoolCreate, PoolRequest } from 'src/features/User/Account/Management/Notiication/interfaces';

interface Metadata {
  timestamp: string;
  totalItem: number;
  totalPage: number;
}

const initialState = {
  countNotRead: -1,
  curPageNotiPopup: 1,
  listNotifications: { code: 0, data: [] as INotification[], metadata: {} as Metadata },
  listNotificationsPopup: { data: [] as INotification[], metadata: {} as Metadata },
  listNotificationsSystem: { data: [] as INotification[], metadata: {} as Metadata },
  poolRequestDetail: {
    requested: {
      data: {} as PoolRequest,
    },
    created: {
      data: {} as PoolCreate,
    },
  },
  loading: false,
  error: '',
};

const notificationSlice = createSlice({
  name: 'tradingFee',
  initialState: initialState,
  reducers: {
    clearPoolRequestDetail: (state) => {
      state.poolRequestDetail = initialState.poolRequestDetail;
    },

    clearListNotification: (state) => {
      state.listNotifications = initialState.listNotifications;
    },

    setCurPageNotiPopup: (state, action: PayloadAction<number>) => {
      state.curPageNotiPopup = action.payload;
    },
  },
  extraReducers: {
    [`${getListNotifications.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getListNotifications.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${getListNotifications.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listNotifications = action.payload;
    },

    // init list notifications popup
    [`${initListNotificationsPopup.pending}`]: (state) => {
      state.loading = true;
    },
    [`${initListNotificationsPopup.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${initListNotificationsPopup.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listNotificationsPopup = action.payload;
      state.curPageNotiPopup = 1;
    },

    // list notifications popup
    [`${getListNotificationsPopup.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getListNotificationsPopup.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${getListNotificationsPopup.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listNotificationsPopup = action.payload.data
        ? {
            ...action.payload,
            data: [...state.listNotificationsPopup.data, ...action.payload.data],
          }
        : action.payload;
    },

    // list notification system
    [`${getListNotificationsSystem.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getListNotificationsSystem.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${getListNotificationsSystem.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.listNotificationsSystem = action.payload;
    },

    // get pool request detail
    [`${getPoolRequestNotificationDetail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getPoolRequestNotificationDetail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${getPoolRequestNotificationDetail.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.poolRequestDetail.requested = action.payload;
    },

    // get pool created detail
    [`${getPoolCreatedNotificationDetail.pending}`]: (state) => {
      state.loading = true;
    },
    [`${getPoolCreatedNotificationDetail.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${getPoolCreatedNotificationDetail.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.poolRequestDetail.created.data = action.payload;
    },

    // count not read
    [`${countNotificationNotRead.pending}`]: (state) => {
      state.loading = true;
    },
    [`${countNotificationNotRead.rejected}`]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [`${countNotificationNotRead.fulfilled}`]: (state, action) => {
      state.loading = false;
      state.countNotRead = action.payload.data;
    },
  },
});

export const { clearPoolRequestDetail, clearListNotification, setCurPageNotiPopup } = notificationSlice.actions;

const { reducer: notificationReducer } = notificationSlice;

export default notificationReducer;
