import { TradingMethodItem } from 'src/interfaces';
import TradeHistoryDarkIcon from 'src/assets/icon/trade-history-dark.svg';
import TradeHistoryLightIcon from 'src/assets/icon/trade-history-light.svg';
import ProfileDarkIcon from 'src/assets/icon/profile-dark.svg';
import ProfileLightIcon from 'src/assets/icon/profile-light.svg';
import SignoutDarkIcon from 'src/assets/icon/signout-dark.svg';
import SignoutLightIcon from 'src/assets/icon/signout-light.svg';
import DashboardDarkIcon from 'src/assets/icon/dashboard-dark.svg';
import DashboardLightIcon from 'src/assets/icon/dashboard-light.svg';
import MarketOverviewDarkIcon from 'src/assets/icon/market-overview-dark.svg';
import MarketOverviewLightIcon from 'src/assets/icon/market-overview-light.svg';
import CombinationMethodIcon from 'src/assets/icon/combination-method.svg';
import { routeConstants } from 'src/constants';
import { ROUTE_SIDEBAR } from 'src/constants/accountSidebarRoute';
import { bscIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';

export const tradingMethodOptions: Array<TradingMethodItem> = [
  {
    darkIcon: StellarOrderBookDarkIcon,
    lightIcon: StellarOrderBookLightIcon,
    text: 'Order Book',
    symbol: 'OB',
    key: 1,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'Order Book',
    symbol: 'OB',
    key: 2,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'FCX Liquidity Pool',
    symbol: 'FCX LP',
    key: 4,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'Pancakeswap Liquidity Pool',
    symbol: 'Pancakeswap LP',
    key: 8,
  },
];

export const accountOptions = [
  {
    darkIcon: '',
    lightIcon: '',
    text: 'email',
    url: '',
  },
  {
    darkIcon: DashboardDarkIcon,
    lightIcon: DashboardLightIcon,
    text: 'Dashboard',
    url: ROUTE_SIDEBAR.account_dashboard_overview,
  },
  {
    darkIcon: TradeHistoryDarkIcon,
    lightIcon: TradeHistoryLightIcon,
    text: 'Trade history',
    url: ROUTE_SIDEBAR.account_trade_history_open_orders,
  },
  {
    darkIcon: ProfileDarkIcon,
    lightIcon: ProfileLightIcon,
    text: 'Account',
    url: ROUTE_SIDEBAR.account_notification,
  },
  {
    darkIcon: SignoutDarkIcon,
    lightIcon: SignoutLightIcon,
    text: 'Sign out',
    url: '/sign-in',
  },
];
export const methodIcons = {
  1: {
    darkIcon: StellarOrderBookDarkIcon,
    lightIcon: StellarOrderBookLightIcon,
  },
  2: {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
  },
  3: {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
  },
  4: {
    darkIcon: CombinationMethodIcon,
    lightIcon: CombinationMethodIcon,
  },
};
export const tradeOptions = [
  {
    darkIcon: DashboardDarkIcon,
    lightIcon: DashboardLightIcon,
    text: 'Dashboard',
    url: routeConstants.DASHBOARD,
  },
  {
    darkIcon: MarketOverviewDarkIcon,
    lightIcon: MarketOverviewLightIcon,
    text: 'Market overview',
    url: routeConstants.MARKET_OVERVIEW,
  },
];

export const loginFlowRoutes = [
  routeConstants.REGISTER,
  routeConstants.FORGOT_PASSWORD,
  routeConstants.SIGN_IN,
  routeConstants.VERIFY_EMAIL,
];
