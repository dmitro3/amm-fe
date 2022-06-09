import { gql, request } from 'graphql-request';
import Web3 from 'web3';
import { pancakePairAbi } from 'src/constants/abi/PancakePair';
import BigNumber from 'bignumber.js';
import { normalizeBalance } from 'src/features/PoolsInfo/components/AddLiquidityModal/helper/utils';

const url = `${process.env.REACT_APP_PANCAKE_SUBGRAPH}`;
const fee = process.env.REACT_APP_PANCAKE_FEE || 0.003;

interface Pair {
  id: string;
  token0: string;
  token1: string;
  token0Decimals: number;
  token1Decimals: number;
}

export async function getPairAddress(token0Address: string, token1Address: string): Promise<Pair> {
  const query = gql`
    {
      pairs(
        where: {
          token0_in: ["${token0Address.toLowerCase()}", "${token1Address.toLowerCase()}"]
          token1_in: ["${token0Address.toLowerCase()}", "${token1Address.toLowerCase()}"]
        }
      ) {
        id
        token0 {
            id
            decimals
        }
        token1 {
            id
            decimals
        }
      }
    }
  `;
  try {
    const res = await request(url, query);
    const data = res.pairs[0];
    return {
      id: data.id,
      token0: data.token0.id,
      token1: data.token1.id,
      token0Decimals: data.token0.decimals,
      token1Decimals: data.token1.decimals,
    };
  } catch (err) {
    throw err;
  }
}

export async function isValidPancakeSwap(
  amountIn: string,
  tokenAddressPath: string[],
  minAmountOut: string,
): Promise<boolean> {
  if (window.web3) {
    await window.ethereum.enable();
    window.web3 = new Web3(window.web3.currentProvider);
    let amountOut = new BigNumber(0);
    let singleAmountIn = amountIn;
    let decimalsIn = 0,
      decimalsOut = 0;
    for (let i = 0; i < tokenAddressPath.length - 1; i++) {
      const pairData = await getPairAddress(tokenAddressPath[i], tokenAddressPath[i + 1]);
      const pairAddress = pairData.id;
      const pair = new window.web3.eth.Contract(pancakePairAbi, pairAddress);
      const reserves = await pair.methods.getReserves().call();
      let reserveIn, reserveOut;
      if (tokenAddressPath[i].toLowerCase() === pairData.token0) {
        reserveIn = reserves._reserve0;
        reserveOut = reserves._reserve1;
        if (i == 0) {
          decimalsIn = pairData.token0Decimals;
        }
        decimalsOut = pairData.token1Decimals;
      } else if (tokenAddressPath[i].toLowerCase() === pairData.token1) {
        reserveIn = reserves._reserve1;
        reserveOut = reserves._reserve0;
        if (i == 0) {
          decimalsIn = pairData.token1Decimals;
        }
        decimalsOut = pairData.token0Decimals;
      }
      const amountInWithFee = new BigNumber(singleAmountIn).times(new BigNumber(1).minus(new BigNumber(fee)));
      const numerator = amountInWithFee.times(reserveOut);
      const denominator = amountInWithFee.plus(reserveIn);
      singleAmountIn = numerator.div(denominator).toFixed(0);
      amountOut = new BigNumber(singleAmountIn);
    }
    return normalizeBalance(new BigNumber(minAmountOut), decimalsIn).lte(
      normalizeBalance(new BigNumber(amountOut), decimalsOut),
    );
  }
  return false;
}
