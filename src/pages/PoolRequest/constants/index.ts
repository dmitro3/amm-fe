import {
  coinDAI,
  coinUSDT,
  coinvCHF,
  coinvEUR,
  coinvTHB,
  coinvUSD,
  coinKINE,
  coinUSDC,
  coinvSGD,
} from 'src/assets/icon';
import { PoolType as PoolTypeEnum } from 'src/interfaces/pool';

export const PoolType = {
  FIXED: { value: PoolTypeEnum.Fixed, label: 'Fixed' },
  FLEXIBLE: { value: PoolTypeEnum.Flexible, label: 'Flexible' },
};

export const POOL_TYPE = {
  FIXED: {
    value: false,
    label: 'Fixed',
  },
  FLEXIBLE: {
    value: true,
    label: 'Flexible',
  },
};

export const POOL_TYPE_BTN = [POOL_TYPE.FIXED, POOL_TYPE.FLEXIBLE];

export const POOL_TYPE_RADIO = {
  FIXED: {
    value: POOL_TYPE.FIXED.value,
    label: POOL_TYPE.FIXED.label,
  },
  FLEXIBLE: {
    value: POOL_TYPE.FLEXIBLE.value,
    label: POOL_TYPE.FLEXIBLE.label,
  },
};

export const FLEXIBLE_POOL_RIGHTS: Record<string, string> = {
  canPauseSwapping: 'Can pause swapping',
  canChangeSwapFee: 'Can change swap fee',
  canChangeWeights: 'Can change weights',
  canAddRemoveTokens: 'Can change tokens ',
  canWhitelistLPs: 'Can limit Liquidity providers',
  canChangeCap: 'Can limit total FPT supply',
};

export const maxDigitsAfterDecimalRegex = /^$|^\d+(\.\d{0,2})?$/;
export const numberRegex = /^$|^\d+(\.\d*)?$/;
export const tokensAddressRegex = /0[xX][0-9a-fA-F]+/;

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  MAX_DIGITS_AFTER_DECIMAL: 'Only 2 number digits after the period',
  FEE_SUM_ERROR: 'The total of Velo admin’s fee and Liquidity provider’s fee must be equal to Swap fee.',
  WEIGHT_SMALLER_THAN_1: 'Weight can’t be smaller than 1',
};

export const COINS = {
  DAI: {
    symbol: 'DAI',
    logo: coinDAI,
  },
  USDT: {
    symbol: 'USDT',
    logo: coinUSDT,
  },
  vCHF: {
    symbol: 'vCHF',
    logo: coinvCHF,
  },
  vEUR: {
    symbol: 'vEUR',
    logo: coinvEUR,
  },
  vTHB: {
    symbol: 'vTHB',
    logo: coinvTHB,
  },
  vUSD: {
    symbol: 'vUSD',
    logo: coinvUSD,
  },
  vGBP: {
    symbol: 'vGBP',
    logo: coinvUSD,
  },
  KINE: {
    symbol: 'KINE',
    logo: coinKINE,
  },
  USDC: {
    symbol: 'USDC',
    logo: coinUSDC,
  },
  vSGD: {
    symbol: 'vSGD',
    logo: coinvSGD,
  },
};

export const MAX_PERCENTAGE = 96;
export const MIN_PERCENTAGE = 4;
export const MIN_FEE = '0.0001'; // MIN_FEE = 10**18 / 10**6
export const MAX_FEE = '100'; // MAX_FEE = 10**18 / 10
export const MAX_WEIGHT = 50; // MAX_WEIGHT = 50 * 10**18
export const MIN_WEIGHT = 1; // MIN_WEIGHT = 10**18
