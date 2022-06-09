import axiosInstance from './config';

export const getPairs = async (): Promise<any> => {
  const res = await axiosInstance
    .get('pair/list')
    .catch((error) => error)
    .then((res) => res);
  return res;
};
