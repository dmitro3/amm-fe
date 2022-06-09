/* eslint-disable max-len */
import { BigNumber } from '@0x/utils';
import { erc20Abi } from 'src/constants/abi/erc20Abi';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from 'src/features/OrderForm/constants/order';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import Web3 from 'web3';

const isApproved = async (
  tokenAddress: string,
  publicKey: string,
  a: string | number | BigNumber,
  exchangeContractAddress: string,
): Promise<boolean> => {
  const amount = new BigNumber(a).gt(0) ? new BigNumber(a) : new BigNumber(0);

  try {
    if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      const tokenContract = new web3.eth.Contract(
        // @ts-ignore
        erc20Abi,
        tokenAddress,
      );
      const allowance = await tokenContract.methods.allowance(publicKey, exchangeContractAddress).call();
      if (!new BigNumber(amount).gt(0)) {
        if (!new BigNumber(allowance).gt(0)) {
          return false;
        }
      } else {
        if (!new BigNumber(allowance).gte(amount)) {
          return false;
        }
      }
    }
  } catch (e) {
    throw e;
  }
  return true;
};

export const approve = async (
  tokenAddress: string,
  publicKey: string,
  a: string | number | BigNumber,
  exchangeContractAddress: string,
): Promise<void> => {
  try {
    if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      const tokenContract = new web3.eth.Contract(
        // @ts-ignore
        erc20Abi,
        tokenAddress,
      );

      // check allowance before sending approve
      if (!(await isApproved(tokenAddress, publicKey, a, exchangeContractAddress))) {
        // approve
        await tokenContract.methods
          .approve(exchangeContractAddress, UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString())
          .send({ from: publicKey });
      }
    }
  } catch (e) {
    throw e;
  }
};

export const isApprovedAll = async (
  publicKey: string,
  behaviour: Behaviour,
  sorType: SORType | null,
  selectedPair?: Pair,
): Promise<boolean> => {
  if (selectedPair && publicKey) {
    try {
      const exchangeContractAddresses = [process.env.REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS];
      const tokenAddress = behaviour === Behaviour.BUY ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address;
      const amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS.div(2);

      if (sorType === SORType.MARKET_SOR) {
        exchangeContractAddresses.push(process.env.REACT_APP_WARP_EXCHANGE_ADDRESS_BSC);
      }

      for (const exchangeContractAddress of exchangeContractAddresses) {
        if (exchangeContractAddress) {
          const result = await isApproved(tokenAddress, publicKey, amount, exchangeContractAddress);
          if (!result) {
            return false;
          }
        } else {
          throw new Error(
            'Missing env: REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS or REACT_APP_WARP_EXCHANGE_ADDRESS_BSC',
          );
        }
      }
    } catch (e) {
      throw e;
    }

    return true;
  }
  return true;
};

export const handleApproveAll = async (
  publicKey: string,
  behaviour: Behaviour,
  sorType: SORType | null,
  selectedPair?: Pair,
): Promise<void> => {
  if (selectedPair && publicKey) {
    try {
      const exchangeContractAddresses = [process.env.REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS];
      const tokenAddress = behaviour === Behaviour.BUY ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address;
      const amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS.div(2);

      if (sorType === SORType.MARKET_SOR) {
        exchangeContractAddresses.push(process.env.REACT_APP_WARP_EXCHANGE_ADDRESS_BSC);
      }

      // check approve 1 more time
      for (const exchangeContractAddress of exchangeContractAddresses) {
        if (exchangeContractAddress) {
          const result = await isApproved(tokenAddress, publicKey, amount, exchangeContractAddress);
          if (result) {
            // remove if exchange contract is approved
            exchangeContractAddresses.filter((v) => v !== exchangeContractAddress);
          }
        } else {
          throw new Error(
            'Missing env: REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS or REACT_APP_WARP_EXCHANGE_ADDRESS_BSC',
          );
        }
      }

      // approve
      if (exchangeContractAddresses.length > 0) {
        for (const exchangeContractAddress of exchangeContractAddresses) {
          if (exchangeContractAddress) {
            await approve(tokenAddress, publicKey, amount, exchangeContractAddress);
          } else {
            throw new Error(
              'Missing env: REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS or REACT_APP_WARP_EXCHANGE_ADDRESS_BSC',
            );
          }
        }
      }
    } catch (e) {
      throw e;
    }
  }
};
