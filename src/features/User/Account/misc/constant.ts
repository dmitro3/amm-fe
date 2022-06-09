import { HIDE_SMALL_BALANCES } from 'src/features/User/Account/Dashboard/Balances/misc';

/* eslint-disable max-len */
export const TITLE_TOOLTIP = {
  profitAndLoss: 'The data maintenance time is 0am - 2am (UTC+0) every day. During this time, PNL is not displayed.',
  commulativePNLPersent:
    'Cumulative PNL(%) = Cumulative PNL / (asset in spot account from day 1 + average net transfer and deposit from day 1 to day N).',
  dailyPNL: 'Daily PNL = Daily final asset in spot account - Initial asset at 00:00:00 UTC - Net transfer and deposit.',
  profit: "Profits = The sum of each day's profit and loss from day 1 to day N.",
  assetAllocation:
    "Asset Allocation = The display of each asset in spot account (sorted by each asset's latest market value).",
  assetNetWorth: 'Asset Net Worth = The total net value of all the assets in spot account from day 1 to day N.',

  // balances
  balaces_order_col:
    'When users place an order, the balance to execute the order will be locked in a smart contract. This will be displayed as “In order”',
  hide_small_balance: `Your digital credits that have total smaller than ${HIDE_SMALL_BALANCES} are classified as small balances`,
};
