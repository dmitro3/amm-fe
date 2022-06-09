export interface Token {
  id: number;
  bsc_address: string;
  symbol: string;
  name: string;
  icon?: string;
}
export interface PoolRequestError {
  weight?: string;
  swapFee?: string;
  swapFeeRatio?: string;
  rights?: string;
}

export interface INewPool {
  type: boolean;
  weights: {
    [tokenAddress: string]: string;
  };
  totalWeight: string;
  swapFee: string;
  feeRatioLp: string;
  feeRatioVelo: string;
  tokens: string[];
  poolTokenSymbol?: string;
  poolTokenName?: string;
  rights: {
    [rightName: string]: boolean;
  };
  minimumWeightChangeBlockPeriod?: string;
  addTokenTimeLockInBlocks?: string;
  initialSupply?: string;
  activeToken?: number;
}

export interface ICreatePool {
  type: number;
  coin_ids: number[];
  weight: string[];
  swap_fee: string;
  fee_ratio_velo: string;
  fee_ratio_lp: string;
  flex_right_config?: string;
}
