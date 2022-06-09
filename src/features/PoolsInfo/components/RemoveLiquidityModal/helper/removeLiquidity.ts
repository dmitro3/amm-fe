import Web3 from 'web3';
import { Crp } from 'src/constants/abi/Crp';
import { BPool } from 'src/constants/abi/BPool';

export interface MultiRemoveParams {
  poolAddress: string;
  poolAmountIn: string;
  minAmountsOut: string[];
  isCrp: boolean;
  account: string;
}
export async function removeMultiAssets(params: MultiRemoveParams): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const poolInstance = params.isCrp
      ? new window.web3.eth.Contract(Crp, params.poolAddress)
      : new window.web3.eth.Contract(BPool, params.poolAddress);
    const result = await poolInstance.methods
      .exitPool(params.poolAmountIn, params.minAmountsOut)
      .send({ from: params.account });

    return result?.status || false;
  }
  return false;
}

export interface SingleRemoveParams {
  poolAddress: string;
  tokenOutAddress: string;
  poolAmountIn: string;
  minTokenAmountOut: string;
  isCrp: boolean;
  account: string;
}

export async function removeSingleAsset(params: SingleRemoveParams): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const poolInstance = params.isCrp
      ? new window.web3.eth.Contract(Crp, params.poolAddress)
      : new window.web3.eth.Contract(BPool, params.poolAddress);
    const result = await poolInstance.methods
      .exitswapPoolAmountIn(params.tokenOutAddress, params.poolAmountIn, params.minTokenAmountOut)
      .send({ from: params.account });

    return result?.status || false;
  }
  return false;
}
