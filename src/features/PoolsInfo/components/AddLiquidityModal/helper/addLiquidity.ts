import BigNumber from 'bignumber.js';
import { BActions } from 'src/constants/abi/BActions';
import { Proxy } from 'src/constants/abi/Proxy';
import { ProxyRegistry } from 'src/constants/abi/ProxyRegistry';
import { normalizeBalance } from 'src/features/PoolsInfo/components/AddLiquidityModal/helper/utils';
import { bActionsAddress, proxyRegistryAddress } from 'src/features/PoolsInfo/constants/address';
import Web3 from 'web3';

export interface MultiAddParams {
  poolAddress: string;
  poolAmountOut?: string;
  maxAmountsIn: Array<string>;
  account: string;
  isCrp: boolean;
}
export async function addMultiAssets(addParams: MultiAddParams): Promise<boolean> {
  if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider);

    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(addParams.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const joinPoolInterface = addParams.isCrp
      ? BActions.find((iface) => iface.name === 'joinSmartPool')
      : BActions.find((iface) => iface.name === 'joinPool');
    const params = [addParams.poolAddress, addParams.poolAmountOut, addParams.maxAmountsIn];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(joinPoolInterface, params);
    web3.eth.handleRevert = true;
    const result = await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: addParams.account,
    });
    return result?.status || false;
  }
  return false;
}

export interface SingleAddParams {
  poolAddress: string;
  tokenInAddress: string;
  tokenAmountIn: string;
  minPoolAmountOut: string;
  account: string;
}

export async function addSingleAsset(addParams: SingleAddParams): Promise<boolean> {
  if (window.web3) {
    await window.ethereum.enable();
    window.web3 = new Web3(window.web3.currentProvider);
    const proxyRegistry = new window.web3.eth.Contract(ProxyRegistry, proxyRegistryAddress);
    const userProxy = await proxyRegistry.methods.proxies(addParams.account).call();
    const proxyInstance = new window.web3.eth.Contract(Proxy, userProxy);

    const joinPoolInterface = BActions.find((iface) => iface.name === 'joinswapExternAmountIn');
    const params = [
      addParams.poolAddress,
      addParams.tokenInAddress,
      addParams.tokenAmountIn,
      addParams.minPoolAmountOut,
    ];
    const functionCall = window.web3.eth.abi.encodeFunctionCall(joinPoolInterface, params);
    window.web3.eth.handleRevert = true;
    const result = await proxyInstance.methods['execute(address,bytes)'](bActionsAddress, functionCall).send({
      from: addParams.account,
    });

    return result?.status;
  }
  return false;
}

export function formatBalance(balance: string, decimal: number, precision?: number): string {
  return normalizeBalance(new BigNumber(balance || 0), decimal).toFixed(precision || 2);
}
