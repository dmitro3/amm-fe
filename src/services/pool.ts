import axios from 'axios';
import BigNumber from 'bignumber.js';
import { gql, request } from 'graphql-request';
import { erc20Abi } from 'src/constants/abi/erc20Abi';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { getSeconds } from 'src/helpers/pool';
import { querySubGraph } from 'src/helpers/subgraph';
import {
  Pool,
  PoolAdd,
  PoolShare,
  PoolSwap,
  PoolType,
  PoolVirtualSwap,
  PoolWithdrawal,
  SwapPairData,
} from 'src/interfaces/pool';
import Web3 from 'web3';

const url = process.env.REACT_APP_SUBGRAPH || '';

const headers = {
  'Content-Type': 'application/json',
};

export const getMyPoolShares = async (address: string, poolId = ''): Promise<PoolShare[]> => {
  if (!address) return [];

  let condition;
  if (poolId) {
    condition = `{
      userAddress: "${address}",
      poolId: "${poolId}",
      balance_gt: 0
    }`;
  } else {
    condition = `{
      userAddress: "${address}",
      balance_gt: 0
    }`;
  }
  const query = gql`
    query getPoolShares {
      poolShares(where: ${condition}) {
        id
        poolId {
          id
          name
          symbol
        }
        balance
      }
    }
  `;
  try {
    const response = await request(url, query);
    return response.poolShares || [];
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
    return [];
  }
};

export const getMyPoolCondition = async (
  crp: boolean,
  poolShares: PoolShare[],
  searchToken: string,
  searchPoolAddress?: string,
): Promise<string> => {
  const poolIds = poolShares.map((poolShare) => `"${poolShare.poolId.id}"`).join(',');
  return `
      {crp: ${crp.toString()}, id_in: [${poolIds}], ${
    searchToken ? `, tokensList_contains: ["${searchToken}"]` : ''
  }, ${searchPoolAddress ? `, id: "${searchPoolAddress}"` : ''}}
    `;
};

export const combineMyLiquidityToPools = (pools: Pool[], poolShares: PoolShare[]): Pool[] => {
  const initBalances: { [key: string]: string } = {};
  const myBalances = poolShares.reduce((balances, poolShare: PoolShare) => {
    balances[poolShare.poolId.id] = poolShare.balance;
    balances.poolIdSymbol = poolShare.poolId.symbol;
    return balances;
  }, initBalances);
  for (const pool of pools) {
    pool.myShareBalance = myBalances[pool.id] || '0';
    pool.myLPTokenSymbol = myBalances.poolIdSymbol;
    if (new BigNumber(pool.totalShares || '0').gt('0') && new BigNumber(pool.liquidity || '0').gt('0')) {
      pool.myLiquidity = new BigNumber(pool.liquidity)
        .times(myBalances[pool.id] || '0')
        .div(pool.totalShares)
        .toString();
    }
  }
  return pools;
};

export const getPoolListQuery = (condition: string, timestamp24h: number): string => {
  return gql`
    query getPoolList{
      pools(
        where: ${condition}
        orderBy: liquidity
        orderDirection: desc
      ) {
        id
        crp
        controller
        swapFee
        tokens {
          id
          balance
          symbol
          denormWeight
        }
        swaps(
          where: {
            timestamp_lte: ${timestamp24h}
          }
          orderBy: timestamp
          orderDirection: desc
          first: 1
        ) {
          poolTotalSwapFee
          poolTotalNetFee
          poolTotalSwapVolume
        }
        shares(where: {balance_gt: 0}) {
          id
        }
        totalShares
        liquidity
        swapFee
        netFee
        tokensList
        totalShares
        totalSwapFee
        totalNetFee
        totalSwapVolume
        totalWeight
        joinsCount
      }
    }
  `;
};

export const getPoolList = async (
  poolType: number,
  myPoolsOnly: boolean,
  address = '',
  searchToken: string,
  searchPoolAddress: string,
): Promise<Pool[]> => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const timestamp24h = Math.floor(date.getTime() / 1000);

  const poolShares = await getMyPoolShares(address);
  const crp = poolType === PoolType.Flexible;
  let condition = `{
    crp: ${crp}
    ${searchToken ? `,tokensList_contains: ["${searchToken}"]` : ''}
    ${searchPoolAddress ? `,id_in: ["${searchPoolAddress}"]` : ''}
   }`;
  if (myPoolsOnly) {
    // const proxy = (await getUserProxy(address)).toLowerCase();
    condition = await getMyPoolCondition(crp, poolShares, searchToken, searchPoolAddress);
  }
  const query = getPoolListQuery(condition, timestamp24h);
  try {
    const response = await request(url, query);
    const pools = response.pools || [];
    return combineMyLiquidityToPools(pools, poolShares);
  } catch (err) {
    return err;
  }
};

export const getPoolDetailById = async (id: string, address: string): Promise<Pool> => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const timestamp24h = Math.floor(date.getTime() / 1000);

  const poolShares = await getMyPoolShares(address);

  const query = gql`
    query getPool{
      pools(where: {
        id: "${id}"
      }){
        id
        createTime
        crp
        crpController
        controller
        finalized
        name
        symbol
        liquidity
        publicSwap
        rights
        swapFee
        protocolFee
        netFee
        swaps(
          where: {
            timestamp_lte: ${timestamp24h}
          }
          orderBy: timestamp
          orderDirection: desc
          first: 1
        ) {
          id
          timestamp
          poolTotalSwapFee
          poolTotalNetFee
          poolTotalSwapVolume
        }
        totalWeight
        tokens {
          address
          id
          balance
          symbol
          denormWeight
        }
        tokensList
        totalShares
        totalSwapFee
        totalNetFee
        totalSwapVolume
        totalWeight
        joinsCount
        swapsCount
        shares(where: {balance_gt: 0}) {
          id
        }
      }
    }
  `;
  try {
    const response = await request(url, query);
    const pools = combineMyLiquidityToPools(response.pools, poolShares);
    return pools[0];
  } catch (err) {
    return err;
  }
};

export const getUserShare = async (poolAddress: string, publicKey: string): Promise<any> => {
  if (!poolAddress || !publicKey) return '0';
  const query = gql`
    query getPoolShare{
      poolShares(where: {
        userAddress: "${publicKey}"
        poolId: "${poolAddress}"
      }) {
        balance
      }
    }
  `;
  const response = await request(url, query);
  if (response.poolShares.length > 0) {
    const data = response.poolShares[0].balance;
    return data;
  } else return '0';
};

export const getSwapsByPool = async (id: string, page: number, perPage: number): Promise<any> => {
  const offset = page * perPage;
  const query = gql`
    query getPoolSwap{
      pool(id: "${id}"){
        id
        swapsCount
        swaps(
          skip: ${offset},
          first: ${perPage},
          orderBy: timestamp, 
          orderDirection: desc
        ){
          id
          tokenIn
          tokenOut
          tokenInSym
          tokenOutSym
          tokenAmountIn
          tokenAmountOut
          value
          timestamp
          poolTotalSwapVolume
          feeValue
          poolLiquidity
        }
      }
    }
  `;
  try {
    const response = await request(url, query);
    return response;
  } catch (err) {
    return err;
  }
};

export const getAddsByPool = async (id: string, page: number, perPage: number): Promise<any> => {
  const offset = page * perPage;
  const query = gql`
    query getPoolAdds {
      pool(id: "${id}"){
        joinsCount
        adds (
          skip: ${offset},
          first: ${perPage},
          orderBy: timestamp, 
          orderDirection: desc
        ){
          id
          tokens {
            id
            tokenIn
            tokenAmountIn
            tokenInSym
          }
          timestamp
        }
      }
    }
  `;
  try {
    const response = await request(url, query);
    return response;
  } catch (err) {
    return err;
  }
};

// TODO: get withdraws count
export const getWithdrawsByPool = async (id: string, page: number, perPage: number): Promise<any> => {
  const offset = page * perPage;
  const query = gql`
    query getPoolWithdraws {
      pool(id: "${id}"){
        exitsCount
        withdraws(
          skip: ${offset},
          first: ${perPage},
          orderBy: timestamp, 
          orderDirection: desc
        ) {
          id
          tokens {
            id
            tokenAmountOut
            tokenOut
            tokenOutSym
          }
          timestamp
        }
      }
    }
  `;
  try {
    const response = await request(url, query);
    return response;
  } catch (err) {
    return err;
  }
};

export const fetchPairSwapsWithInterval = async (
  tokenIn: string,
  tokenOut: string,
  from: number,
  to: number,
  interval: number,
): Promise<{ [key: string]: SwapPairData[] }> => {
  const times: number[] = [];
  for (let time = from; time <= to; time += interval) {
    times.push(time);
  }

  let metricsQuery = '';
  metricsQuery += `
      metrics_0: swaps(
        first: 1,
        orderBy: timestampLogIndex, 
        orderDirection: desc,
        where: {
          tokenIn_in: ["${tokenIn}", "${tokenOut}"]
          tokenOut_in: ["${tokenIn}", "${tokenOut}"]
          timestamp_lt: ${getSeconds(from)}
        }
      ) {
        pairLiquidity
        pairSwapVolume
        timestamp
      }
    `;
  for (const time of times) {
    metricsQuery += `
      metrics_${time}: swaps(
        first: 1,
        orderBy: timestampLogIndex, 
        orderDirection: desc,
        where: {
          tokenIn_in: ["${tokenIn}", "${tokenOut}"]
          tokenOut_in: ["${tokenIn}", "${tokenOut}"]
          timestamp_gte: ${getSeconds(time)}, 
          timestamp_lt: ${getSeconds(time + interval)}
        }
      ) {
        pairLiquidity
        pairSwapVolume
        timestamp
      }
    `;
  }

  return await querySubGraph(`{${metricsQuery}}`);
};

export const fetchPoolSwapsWithInterval = async (
  poolAddress: string,
  times: number[],
): Promise<{ [key: string]: PoolSwap[] }> => {
  let metricsQuery = '';
  metricsQuery += `
      metrics_0: swaps(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_lt: ${getSeconds(times[0])}
        }
      ) {
        poolLiquidity
        poolTotalSwapVolume
        poolTotalSwapFee
        poolTotalNetFee
        timestamp
      }
    `;
  for (let i = 0; i < times.length - 1; i++) {
    const time = times[i];
    metricsQuery += `
      metrics_${time}: swaps(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_gte: ${getSeconds(time)}, 
          timestamp_lt: ${getSeconds(times[i + 1])}
        }
      ) {
        poolLiquidity
        poolTotalSwapVolume
        poolTotalSwapFee
        poolTotalNetFee
        timestamp
      }
    `;
  }

  return await querySubGraph(`{${metricsQuery}}`);
};

export const fetchPoolAddsWithInterval = async (
  poolAddress: string,
  times: number[],
): Promise<{ [key: string]: PoolAdd[] }> => {
  let metricsQuery = '';
  metricsQuery += `
      metrics_0: adds(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_lt: ${getSeconds(times[0])}
        }
      ) {
        poolTotalAddVolume
        poolLiquidity
        timestamp
      }
    `;
  for (let i = 0; i < times.length - 1; i++) {
    const time = times[i];
    metricsQuery += `
      metrics_${time}: adds(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_gte: ${getSeconds(time)}, 
          timestamp_lt: ${getSeconds(times[i + 1])}
        }
      ) {
        poolTotalAddVolume
        poolLiquidity
        timestamp
      }
    `;
  }

  return await querySubGraph(`{${metricsQuery}}`);
};

export const fetchPoolWithdrawsWithInterval = async (
  poolAddress: string,
  times: number[],
): Promise<{ [key: string]: PoolWithdrawal[] }> => {
  let metricsQuery = '';
  metricsQuery += `
      metrics_0: withdraws(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_lt: ${getSeconds(times[0])}
        }
      ) {
        poolTotalWithdrawVolume
        poolLiquidity
        timestamp
      }
    `;
  for (let i = 0; i < times.length - 1; i++) {
    const time = times[i];
    metricsQuery += `
      metrics_${time}: withdraws(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_gte: ${getSeconds(time)}, 
          timestamp_lt: ${getSeconds(times[i + 1])}
        }
      ) {
        poolTotalWithdrawVolume
        poolLiquidity
        timestamp
      }
    `;
  }

  return await querySubGraph(`{${metricsQuery}}`);
};

export const fetchPoolVirtualWithInterval = async (
  poolAddress: string,
  times: number[],
): Promise<{ [key: string]: PoolVirtualSwap[] }> => {
  let metricsQuery = '';
  metricsQuery += `
      metrics_0: virtualSwaps(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_lt: ${getSeconds(times[0])}
        }
      ) {
        poolLiquidity
        timestamp
      }
    `;
  for (let i = 0; i < times.length - 1; i++) {
    const time = times[i];
    metricsQuery += `
      metrics_${time}: virtualSwaps(
        first: 1,
        orderBy: timestamp, 
        orderDirection: desc,
        where: {
          poolAddress: "${poolAddress}"
          timestamp_gte: ${getSeconds(time)}, 
          timestamp_lt: ${getSeconds(times[i + 1])}
        }
      ) {
        poolLiquidity
        timestamp
      }
    `;
  }

  return await querySubGraph(`{${metricsQuery}}`);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getLatestSwapByPair = async (pair: Pair): Promise<any> => {
  // TODO: use pair
  const query = `{
    swaps(where: {
        tokenInSym: "${pair.base_name}",
        tokenOutSym: "${pair.quote_name}",
        tokenIn: "${pair.base_bsc_address}", 
        tokenOut: "${pair.quote_bsc_address}", 
      },
      orderBy: timestamp, 
      orderDirection: desc,
      first: 1
    ) {
      id,
      timestamp,
      tokenAmountIn,
      tokenAmountOut,
      tokenIn,
      tokenOut,
      poolAddress {
        id
      }
    }
  }`;

  try {
    return await axios.post(url, { query: query }, { headers });
  } catch (err) {
    return err;
  }
};

export const getPoolTokens = async (poolAddress: string): Promise<any> => {
  // TODO: use pair
  const query = `{
    pool(id: "${poolAddress}") {
      id
      tokens {
        id
        symbol
        address
        denormWeight
      }
    }
  }
  `;

  try {
    return await axios.post(url, { query: query }, { headers });
  } catch (err) {
    return err;
  }
};

export const getTokenPrices = async (): Promise<any> => {
  const query = `{
    tokenPrices {
      id
      price
      symbol
    }
  }
  `;

  try {
    const response = await querySubGraph(query);
    return response.tokenPrices || [];
  } catch (err) {
    return err;
  }
};

export const getTokensList = async (addresses: string[]): Promise<any> => {
  const query = gql`
    query getTokensList {
      pools(where: {
        id_in:[${addresses.join(', ')}]
      }) {
        id
        tokens {
          symbol  
        }
      }
    }
  `;
  try {
    const response = await request(url, query);
    return response.pools || [];
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
    return [];
  }
};

export const getTokensList2 = async (addresses: Array<string>): Promise<any> => {
  if (window.web3) {
    const res = [];
    const web3 = new Web3(window.web3.currentProvider);

    for (const erc20ContractAddress of addresses) {
      // @ts-ignore
      const tokenContract = new web3.eth.Contract(erc20Abi, erc20ContractAddress);
      const tokenName = await tokenContract.methods.name().call();
      res.push({ symbol: tokenName });
    }

    return res;
  } else {
    return [];
  }
};
