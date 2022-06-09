import axiosInstance from 'src/services/config';

export const getVolatility = async (): Promise<any> => {
  return await axiosInstance
    .get('users/volatility')
    .then((r) => r.data?.annualized.toString() || '')
    .catch((e) => e);
};

export const getInternalCalculation = async (): Promise<any> => {
  return await axiosInstance
    .get('users/confidence')
    .then((r) => r.data)
    .catch((e) => e);
};

export default { getVolatility, getInternalCalculation };
