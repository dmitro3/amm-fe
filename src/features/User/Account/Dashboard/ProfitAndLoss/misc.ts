export enum PnlType {
  Trading = 'trading',
  AddedLiquidity = 'liquidity',
}

export interface IPnlConstant {
  yesterday: number;
  rateChangePnlYesterday: number;
  thirtyDaysAgo: number;
  rateChangePnl30DayAgo: number;
}

export const DEFAULT_PNL = {
  date: '',
  balance_value: 0,
  trade_value: 0,
  transfer_value: 0,

  pnlDaily: 0,
  pnlCommulativeAmount: 0,
};
