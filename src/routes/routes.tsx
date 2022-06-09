/* eslint-disable max-len */
import { routeConstants } from 'src/constants';

// Authentication
import Register2 from 'src/pages/Register';
import VerifyEmail from 'src/pages/VerifyEmail';
import SignIn from 'src/pages/SignIn';
import ForgotPassword from 'src/pages/ForgotPassword';

import Landing from 'src/pages/Landing';
import Dashboard from 'src/pages/Dashboard';
import PoolsList from 'src/pages/PoolsList';

import { Balances } from 'src/features/User/Account/Dashboard/Balances';
import { OverView } from 'src/features/User/Account/Dashboard/OverView';
import { ProfitAndLoss } from 'src/features/User/Account/Dashboard/ProfitAndLoss';
import { OpenOrders } from 'src/features/User/Account/TradeHistory/OpenOrders';
import { OrderHistory } from 'src/features/User/Account/TradeHistory/OrderHistory';
import { TradeHistory } from 'src/features/User/Account/TradeHistory/TradeHistory';
import { ROUTE_SIDEBAR } from 'src/constants/accountSidebarRoute';
import AccountNotification from 'src/features/User/Account/Management/Notiication/components';
import NotificationDetail from 'src/features/User/Account/Management/Notiication/components/NotificationDetail';
import AccountSetting from 'src/features/User/Account/Management/Setting';
import PrivateRoute from './PrivateRoute';
import { Route } from 'react-router';
import PoolsInfo from 'src/pages/PoolsInfo';
import MarketOverview from 'src/pages/MarketOverview';
import PoolRequest from 'src/pages/PoolRequest';
// 404 MAIN TAIN
import NotFound from 'src/pages/Maintain-Notfound/component/404';
import MainTain from 'src/pages/Maintain-Notfound/component/maintain';
const routers = {
  dashboard: {
    exact: true,
    path: routeConstants.DASHBOARD,
    component: Dashboard,
    route: PrivateRoute,
  },
  trade: {
    exact: true,
    path: `${routeConstants.DASHBOARD}trade/:pair`,
    component: Dashboard,
    route: PrivateRoute,
  },
  notfound: {
    exact: true,
    path: routeConstants.NOT_FOUND,
    component: NotFound,
    route: PrivateRoute,
  },
  maintain: {
    exact: true,
    path: routeConstants.MAIN_TAIN,
    component: MainTain,
    route: PrivateRoute,
  },
  landing: {
    exact: true,
    path: routeConstants.LANDING,
    component: Landing,
    route: Route,
  },
  register: {
    exact: true,
    path: routeConstants.REGISTER,
    component: Register2,
    route: Route,
  },
  verifyEmail: {
    exact: true,
    path: routeConstants.VERIFY_EMAIL,
    component: VerifyEmail,
    route: Route,
  },
  signin: {
    exact: true,
    path: routeConstants.SIGN_IN,
    component: SignIn,
    route: Route,
  },
  forgotPassword: {
    exact: true,
    path: routeConstants.FORGOT_PASSWORD,
    component: ForgotPassword,
    route: Route,
  },
  pools: {
    exact: true,
    path: routeConstants.POOLS_LIST,
    component: PoolsList,
    route: PrivateRoute,
  },
  poolRequest: {
    exact: true,
    path: routeConstants.POOL_REQUEST,
    component: PoolRequest,
    route: PrivateRoute,
  },
  poolsInfo: {
    path: routeConstants.POOLS_INFO,
    component: PoolsInfo,
    route: PrivateRoute,
  },

  // account: {
  //   exact: true,
  //   path: '/account',
  //   component: Account,
  //   route: PrivateRoute,
  // },
  account_dashboard_balances: {
    exact: true,
    path: ROUTE_SIDEBAR.account_dashboard_balances,
    component: Balances,
    route: PrivateRoute,
  },
  account_dashboard_overview: {
    exact: true,
    path: ROUTE_SIDEBAR.account_dashboard_overview,
    component: OverView,
    route: PrivateRoute,
  },
  account_dashboard_profitandloss: {
    exact: true,
    path: ROUTE_SIDEBAR.account_dashboard_profit_and_loss,
    component: ProfitAndLoss,
    route: PrivateRoute,
  },
  account_tradehistory_openorders: {
    exact: true,
    path: ROUTE_SIDEBAR.account_trade_history_open_orders,
    component: OpenOrders,
    route: PrivateRoute,
  },
  account_tradehistory_orderhistory: {
    exact: true,
    path: ROUTE_SIDEBAR.account_trade_history_order_history,
    component: OrderHistory,
    route: PrivateRoute,
  },
  account_tradehistory_tradehistory: {
    exact: true,
    path: ROUTE_SIDEBAR.account_trade_history_trade_history,
    component: TradeHistory,
    route: PrivateRoute,
  },
  account_notification: {
    exact: true,
    path: ROUTE_SIDEBAR.account_notification,
    component: AccountNotification,
    route: PrivateRoute,
  },
  account_notification_detail: {
    exact: true,
    path: ROUTE_SIDEBAR.account_notification_detail,
    component: NotificationDetail,
    route: PrivateRoute,
  },
  account_setting: {
    exact: true,
    path: ROUTE_SIDEBAR.account_setting,
    component: AccountSetting,
    route: PrivateRoute,
  },
  market_overview: {
    exact: true,
    path: routeConstants.MARKET_OVERVIEW,
    component: MarketOverview,
    route: Route,
  },
};
export default routers;
