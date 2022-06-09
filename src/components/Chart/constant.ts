export const COLOR_CHART: { [key: string]: string } = {
  vSGD: '#F84960',
  vEUR: '#6E7191',
  vUSD: '#40A92E',
  USDT: '#26a17b',
  vTHB: '#5664DE',
  vCHF: '#3A9CD7',
  FPT: '#1A88C9',
};

export enum SYMBOL_TYPE {
  stock = 'stock',
  bitcoin = 'bitcoin',
}

export const barsUrl = 'trades/bars';
export const CHART_CONTAINER_ID = {
  StellarChart: 'tv_chart_container',
  EvrynetPool: 'tv_chart_container_liqui_pool',
};
