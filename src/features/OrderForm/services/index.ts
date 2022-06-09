import { WarpTransferType } from 'src/features/ConnectWallet/constants/warpTransferType';
import axiosInstance from 'src/services/config';
import { TradingNetwork } from 'src/features/OrderForm/constants/tradingNetwork';
import { ORDER_TYPE } from 'src/features/MyTransactions/Constant';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendOrder = async (data: any): Promise<any> => {
  return await axiosInstance
    .post('order', data)
    .then((res) => res)
    .catch((e) => {
      throw e.response.data.message;
    });
};

export const getFee = async (tradingNetwork?: TradingNetwork, orderType?: string): Promise<any> => {
  const res = await axiosInstance
    .get('trading-fee')
    .then((res) => res)
    .catch((error) => error);
  if (!tradingNetwork && !orderType) {
    return res.data;
  }
  const feeData = res.data?.find((data: any) => {
    return data.name === tradingNetwork;
  });
  if (orderType === ORDER_TYPE.MARKET) {
    return feeData?.market_order.toString() || '-1';
  } else {
    return feeData?.limit_order.toString() || '-1';
  }
};

export const warpInit = async (
  warpTransferType: WarpTransferType,
  from: string,
  to: string,
  typeId: number,
  amount: string,
): Promise<any> => {
  return axiosInstance
    .post('warp/init', { transfer_type: warpTransferType, from, to, type_id: typeId, amount })
    .then((r) => r.data)
    .catch((e) => e);
};

export const warpStart = async (id: number, txHash: string): Promise<any> => {
  return axiosInstance
    .put('warp/start', { id, tx_hash: txHash })
    .then((r) => r.data)
    .catch((e) => e);
};

export default { sendOrder, getFee, warpInit, warpStart };
