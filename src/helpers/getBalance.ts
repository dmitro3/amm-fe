import Web3 from 'web3';
import { Server } from 'stellar-sdk';
import { erc20Abi } from 'src/constants/abi/erc20Abi';
import { BigNumber } from '@0x/utils';
import { getStellarAssetType } from 'src/features/Orderbook/helpers/orderbookHelper';

export const getBalanceInBsc = async (
  accountAddress: string,
  erc20ContractAddress: string,
  decimal: BigNumber | string | number,
): Promise<string> => {
  try {
    const web3 = new Web3(window.web3.currentProvider);
    // @ts-ignore
    const tokenContract = new web3.eth.Contract(erc20Abi, erc20ContractAddress);
    const balance = await tokenContract.methods.balanceOf(accountAddress).call();
    return new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimal)).toString();
  } catch {
    return '';
  }
};

export const getBalanceInStellar = async (
  accountAddress: string,
  asset_type: number,
  asset_code?: string,
  asset_issuer?: string,
): Promise<string> => {
  try {
    const asset_type_string = getStellarAssetType(asset_type);
    const server = new Server(`${process.env.REACT_APP_HORIZON}`);
    // TODO: catch exception when account is not active
    const account = await server.loadAccount(accountAddress);
    const balances = account.balances;
    let balanceData;
    if (asset_type_string === 'native') {
      balanceData = balances.filter((data) => data.asset_type === asset_type_string);
    } else {
      balanceData = balances.filter(
        (data: any) =>
          data.asset_type === asset_type_string && data.asset_code === asset_code && data.asset_issuer === asset_issuer,
      );
    }
    if (balanceData.length === 1) {
      return new BigNumber(balanceData[0]?.balance).toString();
    }
    return '';
  } catch {
    return '';
  }
};

export const getAvailableBalanceInStellar = async (
  accountAddress: string,
  asset_type: number,
  asset_code?: string,
  asset_issuer?: string,
): Promise<string> => {
  try {
    const asset_type_string = getStellarAssetType(asset_type);
    const server = new Server(`${process.env.REACT_APP_HORIZON}`);
    // TODO: catch exception when account is not active
    const account = await server.loadAccount(accountAddress);
    const balances = account.balances;
    let balanceData;
    if (asset_type_string === 'native') {
      balanceData = balances.filter((data) => data.asset_type === asset_type_string);
    } else {
      balanceData = balances.filter(
        (data: any) =>
          data.asset_type === asset_type_string && data.asset_code === asset_code && data.asset_issuer === asset_issuer,
      );
    }
    if (balanceData.length === 1) {
      // @ts-ignore
      return new BigNumber(balanceData[0]?.balance).minus(balanceData[0]?.selling_liabilities || 0).toString();
    }
    return '';
  } catch {
    return '';
  }
};

// without XLM
export const getAllBalanceInStellar = async (accountAddress: string): Promise<Array<any>> => {
  const server = new Server(`${process.env.REACT_APP_HORIZON}`);
  const account = await server.loadAccount(accountAddress);
  const balances = account.balances;
  if (balances) {
    return balances.filter((value: any) => {
      return value.asset_type !== 'native';
    });
  }
  return [];
};

export default { getBalanceInBsc, getBalanceInStellar, getAvailableBalanceInStellar, getAllBalanceInStellar };
