import BigNumber from 'bignumber.js';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { FunctionCurrency } from 'src/interfaces/user';

const UNIT = {
  THOUSAND: 1.0e3,
  MILLION: 1.0e6,
  BILLION: 1.0e9,
};
export const setDataPrecision = (data: string | number | BigNumber, precision: number): string => {
  if (BigNumber.isBigNumber(data)) {
    return data.toFixed(precision).toString();
  }
  return new BigNumber(data).toFixed(precision).toString();
};

export const formatCurrencyAmount = (
  amount: string | number,
  currency: FunctionCurrency,
  exchangeRates: ExchangeRate[],
  zeroValue = '-',
): string => {
  if (!amount || new BigNumber(amount).eq('0')) {
    return zeroValue;
  }

  const rate = exchangeRates.find((rate) => rate.coin === currency.iso_code) || { rate: 1 };

  let result;
  const dataBigNumber = new BigNumber(amount).times(rate.rate);
  if (dataBigNumber.div(UNIT.BILLION).gte(1)) {
    result = dataBigNumber.div(UNIT.BILLION).toFixed(1).toString() + 'B';
  } else if (dataBigNumber.div(UNIT.MILLION).gte(1)) {
    result = dataBigNumber.div(UNIT.MILLION).toFixed(1).toString() + 'M';
  } else if (dataBigNumber.div(UNIT.THOUSAND).gte(1)) {
    result = dataBigNumber.div(UNIT.THOUSAND).toFixed(1).toString() + 'K';
  } else {
    result = dataBigNumber.toFixed(1);
  }
  return `${currency.symbol}${result}`;
};

export function formatPoolNumber(n: string | number, digits = 2, zeroValue = '-'): string {
  if (!n || new BigNumber(n).eq('0')) {
    return zeroValue;
  }
  return new BigNumber(n).toFixed(digits);
}

export function formatPoolPercent(n: string | number, digits = 2, zeroValue = '-'): string {
  if (!n || !new BigNumber(n).gt('0')) {
    return zeroValue;
  }
  return new BigNumber(n).times(100).dp(digits).toString();
}

export function formatFeePercent(n: string | number, digits = 2, zeroValue = '0.00'): string {
  if (!n || new BigNumber(n).eq('0')) {
    return zeroValue;
  }
  return new BigNumber(n).times(100).toFixed(digits);
}

export function formatTokenAmount(amount: string | number, digits = 4): string {
  if (!amount || new BigNumber(amount).eq('0')) {
    return '-';
  }
  return new BigNumber(amount).toFixed(digits);
}
