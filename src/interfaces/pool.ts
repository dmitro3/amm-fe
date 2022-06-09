export interface Token {
  id: string;
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
  denormWeight: string;
}
export interface Balance {
  digitalCredits: string;
  weight: string;
  poolBalance: string;
  myBalance: string;
  myAssetValue: string;
}

export interface Transaction {
  id: number;
  transaction: string;
  price: string;
  digitalCredit: string[][];
  pool: string;
  time: string;
}

export interface Pool {
  createTime: number;
  crp: boolean;
  crpController: string;
  controller: string;
  finalized: boolean;
  id: string;
  name: string;
  symbol: string;
  liquidity: string;
  publicSwap: boolean;
  swapFee: string;
  protocolFee: string;
  netFee: string;
  rights: Array<any>;
  swaps: Array<{ [key: string]: string }>;
  tokens: Array<Token>;
  tokensList: Array<Token>;
  shares: Array<{ [key: string]: string }>;
  totalShares: string;
  totalSwapFee: string;
  totalNetFee: string;
  totalSwapVolume: string;
  totalWeight: string;
  joinsCount: string;
  adds: Array<Add>;
  withdraws: Array<Withdraw>;
  swapsCount: string;
  myLiquidity: string;
  myLPTokenSymbol: string;
  myShareBalance: string;
}

export interface PoolInfo {
  id: number;
  poolAddress: string;
  assets: (string[] | number[] | { [key: string]: any })[];
  swapFee: string;
  totalLiquidity: string;
  myLiquidity: string;
  volume24: string;
  fees24: string;
  lifeTimeFees: string;
  apy: string;
  numberOfLPer: number;
}

export interface PoolShare {
  id: string;
  poolId: {
    id: string;
    symbol: string;
    name: string;
  };
  balance: string;
}

export interface Add {
  tokens: Array<any>;
  timestamp: string;
  totalAmountIn: string;
  poolAddress: string;
}
export interface Withdraw {
  tokens: Array<any>;
  timestamp: string;
  totalAmountOut: string;
  poolAddress: string;
}

export interface TransactionToken {
  address?: string;
  symbol: string;
  amount: string;
}

export interface ChartData {
  id: string;
  swaps: Array<SwapData>;
}

export interface PairData {
  pair: Array<any>;
  swaps: Array<SwapPairData>;
}

export interface SwapData {
  poolTotalSwapFee: string;
  poolTotalSwapVolume: string;
  poolLiquidity: string;
  timestamp: number;
}

export interface SwapPairData {
  pairLiquidity: string;
  pairSwapVolume: string;
  timestamp: number;
}

export interface PoolSwap {
  poolLiquidity: string;
  poolTotalSwapVolume: string;
  poolTotalSwapFee: string;
  poolTotalNetFee: string;
  timestamp: number;
  updatedAt: number;
}

export interface PoolAdd {
  poolTotalAddVolume: string;
  poolLiquidity: string;
  timestamp: number;
  updatedAt: number;
}

export interface PoolWithdrawal {
  poolTotalWithdrawVolume: string;
  poolLiquidity: string;
  timestamp: number;
  updatedAt: number;
}
export interface PoolVirtualSwap {
  poolLiquidity: string;
  timestamp: number;
  updatedAt: number;
}

export enum PoolType {
  Fixed = 1,
  Flexible = 2,
}

export interface IPoolsFixed {
  id: string;
  joinsCount: string;
  liquidity: string;
  myLPTokenSymbol: string;
  myLiquidity: string;
  myShareBalance: string;
  netFee: string;
  shares: Array<{ [key: string]: string }>;
  swapFee: string;
  swaps: Array<{ [key: string]: string }>;
  tokens: Array<Token>;
  tokensList: string[];
  totalNetFee: string;
  totalShares: string;
  totalSwapFee: string;
  totalSwapVolume: string;
  totalWeight: string;
}
