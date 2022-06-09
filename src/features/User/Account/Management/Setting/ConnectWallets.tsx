/* eslint-disable @typescript-eslint/no-unused-vars */
import { createMuiTheme, Dialog, DialogActions, DialogContent, DialogTitle, ThemeProvider } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import classnames from 'classnames/bind';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import {
  isWalletAddressTrustline,
  isWalletAddressExists,
  isWalletStellarAddressActive,
  checkWalletAddressNetwork,
} from 'src/services/user';
import { Network } from 'src/constants/network';
import { getListUserWallet, createUserWallet, updateUserWallet } from 'src/features/User/redux/apis';
import { WalletStatus } from 'src/features/ConnectWallet/constants/wallet';
import { sleep } from 'src/helpers/share';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppSelector } from 'src/store/hooks';
import store from 'src/store/store';
import styleSCSS from 'src/features/User/Account/Management/Setting/Setting.module.scss';
import { FastField, Form, Formik } from 'formik';
import InputField from 'src/components/Form/InputField';
import { Grid, Button } from '@material-ui/core';
import styles from './styles';
import * as yup from 'yup';
import { walletAddressRegex } from 'src/helpers/user';
import stylesPagition from 'src/components/Pagination/style';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { REGISTER_VALIDATE_WALLET_ERROR_MESSAGE } from 'src/constants/errorMsg.message';
import CloseDarkButton from 'src/assets/icon/close-dark.svg';

interface UserWallet {
  address: string;
  created_at: string;
  id: number;
  network?: number | string;
  status: number;
  user_email: string;
  user_id: number;
  user_type: number;
}

interface ISubmitAddress {
  status: number;
  address: string;
}

const cx = classnames.bind(styleSCSS);

const ConnectedWallets: React.FC = () => {
  const classesPagination = stylesPagition();
  const dispatch = useDispatch();
  const theme = store.getState().theme.themeMode;
  const [modalWalletAdd, setModalWalletAdd] = React.useState(false);
  const [walletAdd, setWalletAdd] = useState<string>('');
  const userLogin = useAppSelector((state) => state.auth.currentUser);
  const [currentPage, setCurrentPage] = useState(1);
  const walletsStore: any = useAppSelector((state) => state.user.listUserWallet.data);
  const totalPage = useAppSelector((state) => state.user.listUserWallet.metadata.totalPage);
  const [wallets, setWallets] = useState(walletsStore);
  const [paramsGetListWallet, setParamsGetListWallet] = useState({
    status: [WalletStatus.Whitelisted, WalletStatus.Pending, WalletStatus.Rejected],
    limit: 5,
    page: currentPage,
  });
  const [infoStellar, setInfoStellar] = useState<ISubmitAddress>({
    status: 0,
    address: '',
  });
  const [listUserWallet, setListUserWallet] = useState([]);

  const classes = styles();

  const handleSubmitWallet = async (idWallet: number) => {
    await dispatch(updateUserWallet({ id: idWallet }));
    await dispatch(getListUserWallet(paramsGetListWallet));
  };

  const fetchListUserWallet = async () => {
    const res: any = await dispatch(getListUserWallet(paramsGetListWallet));
    setListUserWallet(res.payload?.data || []);
  };

  useEffect(() => {
    fetchListUserWallet();
  }, [paramsGetListWallet]);

  useEffect(() => {
    setWallets(walletsStore);
  }, [walletsStore]);

  const handleCancel = () => {
    setModalWalletAdd(false);
    setWalletAdd('');
  };
  const lightTheme = createMuiTheme({
    palette: {
      type: 'light',
    },
  });

  const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  const initialValues = {
    address: '',
  };

  const handleChange = async (event: ChangeEvent<unknown>, value: number) => {
    await setParamsGetListWallet({
      ...paramsGetListWallet,
      page: value,
    });
  };

  const validationSchema = yup.object({
    address: yup
      .string()
      .required('This field is required.')
      .matches(
        walletAddressRegex,
        'Sorry, only letters (a-z and A-Z), numbers (0-9), and no space or special characters are allowed.',
      )
      .test(`check-wallet-address`, async function (value) {
        if (value) {
          const walletNetwork = await checkWalletAddressNetwork(value);
          if (walletNetwork?.code === 1)
            return this.createError({
              path: this.path,
              message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.INVALID_ADDRESS,
            });

          const isExists = await isWalletAddressExists(value);
          if (isExists) {
            return this.createError({
              path: this.path,
              message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.ADDRESS_EXISTS,
            });
          }

          if (walletNetwork.data === Network.Stellar) {
            const isActive = await isWalletStellarAddressActive(value);
            if (!isActive) {
              return this.createError({
                path: this.path,
                message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.ADDRESS_NOT_ACTIVE,
              });
            }

            const isTrustline = await isWalletAddressTrustline(value);
            if (!isTrustline) {
              return this.createError({
                path: this.path,
                message: REGISTER_VALIDATE_WALLET_ERROR_MESSAGE.ADDRESS_NOT_TRUSTLINE,
              });
            }
          }
        }

        return true;
      }),
  });
  return (
    <div className={cx('connected-wallet')}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div className={cx('title')}>Connected Wallets</div>
        <div className={cx('button-edit')} onClick={() => setModalWalletAdd(true)}>
          Submit address for whitelisting
        </div>
      </div>
      <div className={cx('data-grid-wrap')}>
        <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
          <div className={cx('table')}>
            <table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Network support</th>
                </tr>
              </thead>
              <tbody>
                {listUserWallet.length > 0 &&
                  listUserWallet.map((item: UserWallet, index) => (
                    <tr key={index}>
                      <td>{item.address}</td>
                      <td>
                        {item.status === WalletStatus.Whitelisted
                          ? 'Whitelisted'
                          : item.status === WalletStatus.Pending
                          ? 'Pending'
                          : item.status === WalletStatus.Rejected
                          ? 'Rejected'
                          : '-'}
                      </td>
                      <td>{item.network === Network.Stellar ? 'Stellar' : 'BSC'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {totalPage > 0 && (
            <div className={cx('footer-pagination')}>
              <Pagination
                className={classesPagination.pagination}
                count={totalPage}
                variant="outlined"
                shape="rounded"
                onChange={handleChange}
              />
            </div>
          )}
        </ThemeProvider>
      </div>
      <Dialog
        className={`${cx('dialog')} ${classes.dialog}`}
        open={modalWalletAdd}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title" className={cx('title')}>
          Submit address for whitelisting
        </DialogTitle>
        <span className={cx('icon-container')}>
          <img src={CloseDarkButton} onClick={() => setModalWalletAdd(false)} alt="" />
        </span>

        <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (value, { setSubmitting, resetForm }) => {
              const { address } = value;
              setSubmitting(true);
              const body: ISubmitAddress = {
                status: WalletStatus.Pending,
                address: address,
              };
              const addressType = address?.slice(0, 2) !== '0x' ? 'Stellar' : 'BSC';

              // if (addressType === 'Stellar') {
              //   setInfoStellar(body);
              // } else {
              const res: any = await dispatch(createUserWallet(body));
              if (!res?.code) {
                resetForm();
                setModalWalletAdd(false);
                await sleep(1000); // wait for data sync from master to slave
                fetchListUserWallet();
                dispatch(
                  openSnackbar({
                    message: 'Submit wallet successfully!',
                    variant: SnackbarVariant.SUCCESS,
                  }),
                );
              }
              // }
              setSubmitting(false);
            }}
          >
            {() => {
              return (
                <Form className={classes.form} id="create-form">
                  <Grid style={{ marginBottom: 30, display: 'flex' }} className={cx('input')}>
                    <FastField
                      name="address"
                      component={InputField}
                      label=""
                      placeholder="Wallet address"
                      isAddress={false}
                      isNoSpace={true}
                      regex={walletAddressRegex}
                    />
                  </Grid>
                  <DialogActions className={cx('actions')}>
                    <Button
                      className={cx('button-cancel')}
                      onClick={() => handleCancel()}
                      variant="contained"
                      color="primary"
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className={cx('button-submit')}
                      form="create-form"
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </DialogActions>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default ConnectedWallets;
