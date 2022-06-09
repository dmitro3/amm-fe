import { BigNumber } from '@0x/utils';
import request from 'graphql-request';
import { formatTokenAmount } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { BalancesPools, ObjectAny, SeriesChartBalances } from 'src/features/User/Account/misc';
import { getPublicKeyFromPrivateKey } from 'src/helpers/stellarHelper/address';
import { Pool, PoolType, Token } from 'src/interfaces/pool';
import { FunctionCurrency } from 'src/interfaces/user';
import axiosInstance from 'src/services/config';
import { combineMyLiquidityToPools, getMyPoolCondition, getMyPoolShares, getPoolListQuery } from 'src/services/pool';
import { RootState } from 'src/store/store';
import { ExchangeRate } from 'src/interfaces/exchange-rate';

export const renderLabelLPToken = (label: string): string => `${label.slice(0, 5)}...${label.slice(-3)}`;

export const currentCurrenciesSelected = (state: RootState): FunctionCurrency => {
  const functionalCurrencies = state.functionalCurrency.functionalCurrencies;
  const selectedFunctionalCurrencyId = state.auth.currentUser.selectedFunctionalCurrencyId;
  return (
    functionalCurrencies?.data?.find((currency) => currency.id === selectedFunctionalCurrencyId) || {
      id: 0,
      symbol: '$',
      number_basic: 0,
      iso_code: 'USD',
      fractional_unit: '',
      digital_credits: 'vUSD',
      currency: 'USD',
    }
  );
};

export const convertValueToUSD = (
  value: number,
  symbol: string,
  exchangeRates: ExchangeRate[],
  functionalCurrencies: FunctionCurrency[],
): number => {
  const isoCode = functionalCurrencies?.find((cur) => cur.digital_credits === symbol)?.iso_code || 'USD';

  return new BigNumber(value).div(new BigNumber(exchangeRates.find((i) => i.coin === isoCode)?.rate || 1)).toNumber();
};

export const convertValueUsdToAmountSymbol = (
  value: number,
  symbol: string,
  exchangeRates: ExchangeRate[],
  functionalCurrencies: FunctionCurrency[],
): number => {
  const isoCode = functionalCurrencies?.find((cur) => cur.digital_credits === symbol)?.iso_code || 'USD';

  return new BigNumber(value).times(new BigNumber(exchangeRates.find((i) => i.coin === isoCode)?.rate || 1)).toNumber();
};

export const convertValueUSDToCurSelector = (
  value: number,
  curSelector: FunctionCurrency,
  exchangeRates: ExchangeRate[],
): number => {
  const rateUsdToCurSelector = exchangeRates.find((i) => i.coin === curSelector.iso_code)?.rate || 1;
  return new BigNumber(value).times(new BigNumber(rateUsdToCurSelector)).toNumber();
};

export const reduceTotalAmountToken = (array: SeriesChartBalances[]): SeriesChartBalances[] => {
  return array.reduce((total: SeriesChartBalances[], item: SeriesChartBalances) => {
    const index = total.findIndex((v) => v.symbol === item.symbol);
    if (index !== -1) {
      total.splice(index, 1, {
        value: new BigNumber(total[index]?.value || 0).plus(new BigNumber(item.value)).toNumber(),
        symbol: item.symbol,
      });
    } else {
      total.push(item);
    }
    const rs = total.filter((item) => item.value > 0);

    return rs;
  }, []);
};

export const getRateFromCurrencies = (
  symbol: string,
  exchangeRates: ExchangeRate[],
  functionalCurrencies: FunctionCurrency[],
): number => {
  const isoCode = functionalCurrencies?.find((cur) => cur.digital_credits === symbol)?.iso_code || 'USD';
  return exchangeRates.find((i) => i.coin === isoCode)?.rate || 1;
};

export const convertObjDataSeriesChart = (obj: { [key: string]: string | number }): SeriesChartBalances[] => {
  const ObjToArray = Object.keys(obj);
  const rs = ObjToArray.map((item) => ({
    symbol: item,
    value: new BigNumber(obj[item]).toNumber(),
  }));
  return rs;
};

export const totalBalances = (balancesAll: SeriesChartBalances[], toFix = 2): number => {
  // rate : rate of currencies with USD, toFix: fix number after comma
  return new BigNumber(
    balancesAll.reduce(
      (total, item) => new BigNumber(new BigNumber(total).plus(new BigNumber(item.value))).toNumber(),
      0,
    ),
  )
    .decimalPlaces(toFix)
    .toNumber();
};

export const renderDonutChartBalances = (balances: SeriesChartBalances[], maxItem = 6): SeriesChartBalances[] => {
  const newBalances = balances.sort((a, b) => b.value - a.value);

  const rs =
    balances.length <= maxItem
      ? newBalances
      : newBalances.slice(0, maxItem).concat({
          symbol: 'Other',
          value: totalBalances(balances.slice(maxItem)),
        });
  return (
    rs
      .map((i) => ({
        symbol: i.symbol,
        value: new BigNumber(i.value).div(new BigNumber(totalBalances(rs, 4))).toNumber(),
      }))
      // filter value of token < 0.01%
      .filter((i) => i.value >= 0.0001)
  );
};

const url = process.env.REACT_APP_SUBGRAPH || '';
const getPoolListOverview = async (poolType: number, myPoolsOnly: boolean, address = ''): Promise<Pool[]> => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const timestamp24h = Math.floor(date.getTime() / 1000);

  const poolShares = await getMyPoolShares(address);
  const crp = poolType === PoolType.Flexible;
  let condition = `{
    crp: ${crp}
   }`;
  if (myPoolsOnly) {
    // const proxy = (await getUserProxy(address))?.toLowerCase();
    condition = await getMyPoolCondition(crp, poolShares, '');
  }
  const query = getPoolListQuery(condition, timestamp24h);
  try {
    const response = await request(url, query);
    const pools = response.pools || [];
    return combineMyLiquidityToPools(pools, poolShares);
  } catch (err) {
    throw err;
  }
};

function formatPoolNumber(n: string | number, digits = 2, zeroValue = '-'): string {
  if (!n || new BigNumber(n).eq('0')) {
    return zeroValue;
  }
  return new BigNumber(n).toFixed(digits);
}

export interface ResponseData<T> {
  code: number;
  data: T;
  metadata: {
    [key: string]: any;
  };
}

export const getWalletStellar = (state: RootState): string => {
  const wallet = state.wallet;
  return (
    getPublicKeyFromPrivateKey(wallet.privateKey) ||
    wallet.freighter ||
    wallet.trezor.publicKey ||
    wallet.ledger.publicKey
  );
};

// Get Balances In Order
export const getBalancesInOrder = async (wallet: string): Promise<SeriesChartBalances[]> => {
  const resOrder: ResponseData<ObjectAny> = await axiosInstance.get(`order/balances-in-order`, {
    params: wallet,
  });
  const resOrderMap = Object.keys(resOrder.data);

  const resOrderKey = resOrderMap.map((item) => ({
    symbol: item,
    value: new BigNumber(resOrder.data[item]).toNumber(),
  }));
  return resOrderKey;
};
export interface PoolsInfoInPool {
  address: string;
  value: BalancesPools[];
  symbol: string;
  myShareBalance: number;
  urlBsc: string;
  myLiquidity: string;
}

export interface BalancesInPoolAndLPToken {
  poolsAssetValue: SeriesChartBalances[];
  poolsBalances: SeriesChartBalances[];
  poolsInfo: PoolsInfoInPool[];
  lpToken: SeriesChartBalances[];
}

interface IPoolBalances {
  poolId: string;
  address: string;
  symbol: string;
  myShareBalance: string;
  tokens: BalancesPools[];
  myLiquidity: string;
}
// Get Balances In Pool
export const getBalancesInPools = async (wallet: string, coin: string[]): Promise<BalancesInPoolAndLPToken> => {
  try {
    const poolsFlexible: Pool[] = await getPoolListOverview(PoolType.Flexible, true, wallet.toLowerCase());
    const poolsFixed: Pool[] = await getPoolListOverview(PoolType.Fixed, true, wallet.toLowerCase());
    const balancerArr: IPoolBalances[] = [...poolsFlexible, ...poolsFixed].map((pool: Pool) => {
      const hasTotalShares = new BigNumber(pool.totalShares || '0').gt('0');
      const ratio = hasTotalShares ? new BigNumber(pool.myShareBalance).div(pool.totalShares) : new BigNumber('0');
      const balancesArr = pool.tokens.map((token: Token) => {
        return {
          digitalCredits: token.symbol,
          myBalance: formatTokenAmount(ratio.times(token.balance).toString()),
          myAssetValue: formatPoolNumber(
            ratio.times(pool.liquidity).times(token.denormWeight).div(pool.totalWeight).toString(),
          ),
        };
      });
      return {
        poolId: pool.id,
        address: pool.crp ? pool.controller : pool.id,
        symbol: pool.myLPTokenSymbol,
        tokens: balancesArr,
        myShareBalance: pool.myShareBalance,
        myLiquidity: pool.myLiquidity,
      };
    });

    return {
      poolsAssetValue: reduceTotalAmountToken(
        balancerArr
          .map((i) => i.tokens)
          .flat()
          .filter((i) => coin.includes(i.digitalCredits) && Number(i.myAssetValue) > 0)
          .map((item) => ({
            value: new BigNumber(item.myAssetValue).toNumber(),
            symbol: item.digitalCredits,
          })),
      ),
      poolsBalances: reduceTotalAmountToken(
        balancerArr
          .map((i) => i.tokens)
          .flat()
          .filter((i) => coin.includes(i.digitalCredits) && Number(i.myBalance) > 0)
          .map((item) => ({
            value: new BigNumber(item.myBalance).toNumber(),
            symbol: item.digitalCredits,
          })),
      ),
      lpToken: reduceTotalAmountToken(
        balancerArr.map((item) => ({
          value: item.tokens.reduce((t, i) => new BigNumber(t).plus(new BigNumber(i.myAssetValue || 0)).toNumber(), 0),
          symbol: `${renderLabelLPToken(item.address)} (${item.symbol})`,
        })),
      ),
      poolsInfo: balancerArr
        .filter((i) => Number(i.myLiquidity) > 0)
        .map((pool: IPoolBalances) => ({
          address: pool.poolId,
          urlBsc: pool.address,
          symbol: `${renderLabelLPToken(pool.address)} (${pool.symbol})`,
          myShareBalance: new BigNumber(pool.myShareBalance).toNumber(),
          value: pool.tokens.filter((i) => coin.includes(i.digitalCredits) && Number(i.myAssetValue) > 0),
          myLiquidity: pool.myLiquidity,
        })),
    };
  } catch (error) {
    throw error;
  }
};
