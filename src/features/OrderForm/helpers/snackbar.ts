import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import store from 'src/store/store';

export const openErrorSnackbar = (message: string): void => {
  store.dispatch(
    openSnackbar({
      message: message,
      variant: SnackbarVariant.ERROR,
    }),
  );
};

export const openSuccessSnackbar = (message: string): void => {
  store.dispatch(
    openSnackbar({
      message: message,
      variant: SnackbarVariant.SUCCESS,
    }),
  );
};

export default { openErrorSnackbar, openSuccessSnackbar };
