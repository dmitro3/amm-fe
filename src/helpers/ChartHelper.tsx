import { MakeApiRequest } from 'src/interfaces/chart/makeApiRequest';
import axiosInstance from 'src/services/config';

export async function makeApiRequest(path: string, params: MakeApiRequest): Promise<any> {
  if (!params.network?.length) return;
  return await axiosInstance
    .get(`${path}`, { params })
    .catch((error) => error)
    .then((res) => res.data);
}
