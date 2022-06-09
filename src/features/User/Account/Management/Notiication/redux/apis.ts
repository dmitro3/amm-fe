import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/services/config';
import { gql, request } from 'graphql-request';
import { IFilter } from 'src/features/User/Account/Management/Notiication/interfaces';
import { setSnackbarError } from 'src/services/admin';

const urlSubgraph = `${process.env.REACT_APP_SUBGRAPH}`;

export const getListNotifications = createAsyncThunk('get-list-notification', async (body: IFilter) => {
  try {
    const res = await axiosInstance.get(`/notification`, { params: body });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const getListNotificationsPopup = createAsyncThunk('get-list-notification-popup', async (body: IFilter) => {
  try {
    const res = await axiosInstance.get(`/notification`, { params: body });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const initListNotificationsPopup = createAsyncThunk('init-list-notification-popup', async (body: IFilter) => {
  try {
    const res = await axiosInstance.get(`/notification`, { params: body });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const getListNotificationsSystem = createAsyncThunk('get-list-notifications-system', async (body: IFilter) => {
  try {
    const res = await axiosInstance.get('notification/system', { params: body });
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const hideNotification = createAsyncThunk('hide-notification', async (body: { id: number }) => {
  try {
    const res = await axiosInstance.put('/notification/hide', body);
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const readNotification = createAsyncThunk('read-notification', async (body: { ids: number[] }) => {
  try {
    const res = await axiosInstance.put('/notification/read', body);
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const readAllNotifications = createAsyncThunk('read-all-notification', async () => {
  try {
    const res = await axiosInstance.put('/notification/read');
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const deleteAllNotifications = createAsyncThunk('delete-all-notification', async () => {
  try {
    const res = await axiosInstance.put('/notification/trash');
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const countNotificationNotRead = createAsyncThunk('count-notification-not-read', async () => {
  try {
    const res = await axiosInstance.get(`/notification/count-not-read`);
    return res;
  } catch (err) {
    setSnackbarError(err.response.data.message);
    throw err;
  }
});

export const getPoolRequestNotificationDetail = createAsyncThunk(
  'get-pool-request-notification-detail',
  async (id: number) => {
    try {
      const res = await axiosInstance.get(`/pools/pool-requests/${id}`);
      return res;
    } catch (err) {
      setSnackbarError(err.response.data.message);
      throw err;
    }
  },
);

export const getPoolCreatedNotificationDetail = createAsyncThunk(
  'get-pool-created-notification-detail',
  async (poolId: string) => {
    const query = gql`
    {
      pool (id: "${poolId}") {
        id
        crp
        tokens {
          id
          balance
          symbol
          denormWeight
          name
          address
        }
        totalWeight
        netFee
        protocolFee
        swapFee
        rights
      }
    }`;

    try {
      const res = await request(urlSubgraph, query);
      return res.pool;
    } catch (err) {
      setSnackbarError(JSON.stringify(err.response.errors, null, 2));
      throw err;
    }
  },
);
