/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosRequestConfig } from 'axios';
import { TIMEOUT } from 'src/constants';
import routeConstants from 'src/constants/routeConstants';
import { getCookieStorage, removeAllCookieStorage, setAllCookieStorage } from 'src/helpers/storage';
import httpExceptionSubCode from 'src/constants/httpExceptionSubCode';
import { accountDisabled } from 'src/store/accountDisabled';
import store from 'src/store/store';
import jwt_decode from 'jwt-decode';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';

const axiosInstance = axios.create({
  // eslint-disable-next-line max-len
  baseURL: `${process.env.REACT_APP_BASE_API}/${process.env.REACT_APP_API_VERSION}`,
  timeout: TIMEOUT,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isAlreadyFetchingAccessToken = false;
let failedQueue: any[] = [];

async function getAccessToken(refreshToken: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const access_token = await axios
    .post(`${process.env.REACT_APP_BASE_API}/${process.env.REACT_APP_API_VERSION}/auth/access-token`, {
      refreshToken: refreshToken,
    })
    .then((res) => res.data.data.access_token)
    .catch((er) => {
      removeAllCookieStorage(['access_token', 'refresh_token', 'expire_token', 'expire_refresh_token']);
      window.location.replace(routeConstants.SIGN_IN);
    });

  // Set cookie
  if (access_token) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenDecoded: any = jwt_decode(access_token);
      const expToken = tokenDecoded.exp ? parseFloat(tokenDecoded.exp) * 1000 : 0;

      setAllCookieStorage([
        { key: 'access_token', value: access_token },
        { key: 'expire_token', value: expToken },
      ]);
      failedQueue.forEach((cb) => cb(access_token));
    } catch (error) {
    } finally {
      failedQueue = [];
      isAlreadyFetchingAccessToken = false;
    }
  }
}

axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const accessToken = getCookieStorage('access_token');
    const expireToken = parseFloat(getCookieStorage('expire_token') || '0');
    const expireRefreshToken = parseFloat(getCookieStorage('expire_refresh_token') || '0');

    if (!!accessToken && expireToken && expireRefreshToken && new Date().getTime() > expireRefreshToken) {
      removeAllCookieStorage(['access_token', 'refresh_token', 'expire_token', 'expire_refresh_token']);
      window.location.replace(routeConstants.SIGN_IN);
    }

    // if (new Date().getTime() > expireToken && accessToken && expireToken) {
    //   // await getAccessToken(refreshToken);
    //   accessToken = getCookieStorage('access_token');
    // }

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  async (response) => {
    if (response && response.data) {
      return response.data;
    }

    return response;
  },
  (error) => {
    if (!error.response) {
      store.dispatch(
        //@ts-ignore
        openSnackbar({
          message: 'No Internet connection',
          variant: SnackbarVariant.ERROR,
        }),
      );
      return Promise.reject(error);
    }
    switch (error.response?.status) {
      case 401:
        if (!isAlreadyFetchingAccessToken) {
          getAccessToken(getCookieStorage('refresh_token')).then();
          isAlreadyFetchingAccessToken = true;
        }
        return new Promise(function (resolve, reject) {
          failedQueue.push((newAccessToken: string) => {
            error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            try {
              resolve(axiosInstance(error.config)); // retry
            } catch (err) {
              reject(err);
            }
          });
        });

      case 403:
        if (error.response.data?.code === httpExceptionSubCode.FORBIDDEN.USER_DEACTIVE) {
          removeAllCookieStorage(['access_token', 'refresh_token', 'expire_token', 'expire_refresh_token']);
          store.dispatch(accountDisabled());
        }
        break;

      case 404:
        // window.location.href = PATH.PAGE_404;
        break;

      case 500:
        break;

      default:
        break;
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
