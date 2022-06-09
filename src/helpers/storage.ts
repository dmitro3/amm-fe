import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';

interface DataStorage {
  key: string;
  value: any;
}

// cookie
export const getCookieStorage = (key: string): any => Cookies.get(key);

export const setOneCookieStorage = (key: string, data: string | number | any): any => {
  const domain = process.env.REACT_APP_COOKIE_DOMAIN || '';
  Cookies.set(key, typeof data === 'object' ? JSON.stringify(data) : data, { domain });
};

export const setAllCookieStorage = (data: DataStorage[]): any =>
  data.forEach((item) => setOneCookieStorage(item.key, item.value));

export const removeOneCookieStorage = (key: string): any => {
  const domain = process.env.REACT_APP_COOKIE_DOMAIN || '';
  Cookies.remove(key, { domain });
};

export const removeAllCookieStorage = (data: string[]): any => data.forEach((item) => removeOneCookieStorage(item));

export const setTokenCookie = (access_token: string, refresh_token: string): void => {
  try {
    const tokenDecoded: any = jwt_decode(access_token);
    const refreshTokenDecoded: any = jwt_decode(refresh_token);
    const expToken = tokenDecoded.exp ? parseFloat(tokenDecoded.exp) * 1000 : 0;
    const expRefreshToken = refreshTokenDecoded.exp ? parseFloat(refreshTokenDecoded.exp) * 1000 : 0;

    setAllCookieStorage([
      { key: 'access_token', value: access_token },
      { key: 'refresh_token', value: refresh_token },
      { key: 'expire_refresh_token', value: expRefreshToken },
      { key: 'expire_token', value: expToken },
    ]);
  } catch (error) {}
};
