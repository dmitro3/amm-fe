import BigNumber from 'bignumber.js';
import { erc20Abi } from 'src/constants/abi/erc20Abi';
import { constants } from 'ethers';
import Web3 from 'web3';

export async function getUserBalance(publicKey: string, token: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
    return await tokenInstance.methods.balanceOf(publicKey).call();
  }
  return '';
}

export async function checkApprove(publicKey: string, proxy: string, token: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
    const allowance = await tokenInstance.methods.allowance(publicKey, proxy).call();
    return new BigNumber(allowance).gt(0);
  }
  return false;
}

export async function approve(publicKey: string, proxy: string, token: string): Promise<void> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const tokenInstance = await new window.web3.eth.Contract(erc20Abi, token);
    await tokenInstance.methods.approve(proxy, constants.MaxUint256).send({ from: publicKey });
  }
}
