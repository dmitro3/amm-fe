import { Contract, providers } from 'ethers';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import axiosInstance from 'src/services/config';
import { isWhitelistBSC, isWhitelistStellar } from 'src/features/ConnectWallet/helpers/whitelist';
import { whitelistABI } from 'src/constants/abi/whitelistABI';
import axios from 'axios';
import { WalletStatus } from 'src/features/ConnectWallet/constants/wallet';

export const checkWhitelistBSC = async (address: string): Promise<boolean> => {
  const provider = new providers.JsonRpcProvider(process.env.REACT_APP_RPC_PROVIDER);
  const aclInstance = new Contract(process.env.REACT_APP_WHITELIST_CONTRACT_ADDRESS || '', whitelistABI, provider);
  const res = await aclInstance.getRoles(address);
  return isWhitelistBSC(res || []);
};

export const checkWhitelistStellar = async (publicKey: string, pairs: Array<Pair>): Promise<boolean> => {
  const response = await axios.get(`${process.env.REACT_APP_HORIZON}accounts/${publicKey}`).catch((error) => error);
  return isWhitelistStellar((response && response.data.balances) || [], pairs);
};

export const createUserWallet = async (
  address: string,
  action: 'addNewWallet' | 'submitForWhitelist',
): Promise<number> => {
  return await axiosInstance
    .post('wallet/user-create', {
      address,
      status: action === 'addNewWallet' ? WalletStatus.Submit : WalletStatus.Pending,
    })
    .then((res) => {
      if (res.data.error_code === 'UW00002') {
        return 0;
      } else if (res.data.error_code === 'UW00000') {
        return 2;
      } else {
        return 1;
      }
    })
    .catch((e) => e);
};

export default {
  checkWhitelistBSC,
  checkWhitelistStellar,
  createUserWallet,
};
