import BigNumber from 'bignumber.js';
import request, { gql } from 'graphql-request';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { FunctionCurrency } from 'src/interfaces/user';

const url = process.env.REACT_APP_SUBGRAPH || '';

const UNIT = {
  THOUSAND: 1.0e3,
  MILLION: 1.0e6,
  BILLION: 1.0e9,
};

export interface MyPoolShare {
  swapFee: string;
  loss: string;
  balance: string;
}

export async function getMyInfor(publicKey: string, poolAddress: string): Promise<MyPoolShare | undefined> {
  const query = gql`
    query getPoolShare{
      poolShares(where: {
        userAddress: "${publicKey}"
        poolId: "${poolAddress}"
      }) {
        swapFee
        loss
        balance
      }
    }
  `;
  const response = await request(url, query);
  if (response.poolShares.length > 0) {
    const data = response.poolShares[0];
    return data;
  }
}

export const formatCurrencyAmount = (
  amount: BigNumber,
  currency: FunctionCurrency,
  exchangeRates: ExchangeRate[],
  zeroValue = '-',
  precision = 2,
): string => {
  if (!amount || new BigNumber(amount).eq('0')) {
    return zeroValue;
  }

  const rate = exchangeRates.find((rate) => rate.coin === currency.iso_code) || { rate: 1 };

  let result;
  const dataBigNumber = amount.times(rate.rate);
  if (dataBigNumber.div(UNIT.BILLION).gte(1)) {
    result = dataBigNumber.div(UNIT.BILLION).toFixed(1).toString() + 'B';
  } else if (dataBigNumber.div(UNIT.MILLION).gte(1)) {
    result = dataBigNumber.div(UNIT.MILLION).toFixed(1).toString() + 'M';
  } else if (dataBigNumber.div(UNIT.THOUSAND).gte(1)) {
    result = dataBigNumber.div(UNIT.THOUSAND).toFixed(1).toString() + 'K';
  } else {
    result = dataBigNumber.toFixed(precision);
  }
  if (dataBigNumber.lt(0.01) && dataBigNumber.gt(0)) {
    return `< ${currency.symbol}0.01`;
  } else if (dataBigNumber.gt(-0.01) && dataBigNumber.lt(0)) {
    return `> ${currency.symbol}-0.01`;
  } else {
    return `${currency.symbol}${result}`;
  }
};

export const formatCurrencyPercent = (amount: BigNumber, zeroValue = '-'): string => {
  if (!amount || new BigNumber(amount).eq('0')) {
    return zeroValue;
  }
  if (amount.lt(0.0001) && amount.gt(0)) {
    return `< 0.0001%`;
  } else if (amount.gt(-0.0001) && amount.lt(0)) {
    return `> -0.0001%`;
  } else {
    return `${amount.toFixed(4)}%`;
  }
};
