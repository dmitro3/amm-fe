/* eslint-disable @typescript-eslint/no-explicit-any */
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import store from 'src/store/store';
import axiosInstance from './config';

export const setSnackbarSuccess = (message: string): void => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.SUCCESS,
    }),
  );
};

export const setSnackbarError = (message: string): void => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.ERROR,
    }),
  );
};

export const changePasswordFirstLogin = async (body: {
  username: string;
  password: string;
  newPassword: string;
}): Promise<any> => {
  const res = await axiosInstance
    .post('/auth/admin/admin-change-password-first-login', body)
    .then((res) => {
      setSnackbarSuccess('Password has been changed successfully.');
      return res;
    })
    .catch((error) => {
      setSnackbarError(error.response.data.message);
      return error.response.data;
    });

  return res;
};
