/* eslint-disable max-len */
import Account from 'src/features/User/Account';
import { Balances } from 'src/features/User/Account/Dashboard/Balances';
import { OverView } from 'src/features/User/Account/Dashboard/OverView';
import { ProfitAndLoss } from 'src/features/User/Account/Dashboard/ProfitAndLoss';
import { OpenOrders } from 'src/features/User/Account/TradeHistory/OpenOrders';
import { OrderHistory } from 'src/features/User/Account/TradeHistory/OrderHistory';
import { TradeHistory } from 'src/features/User/Account/TradeHistory/TradeHistory';
import IconLibraryBooks from '@material-ui/icons/LibraryBooks';
import AccountNotification from 'src/features/User/Account/Management/Notiication/components';
import AccountSetting from 'src/features/User/Account/Management/Setting';
import NotificationDetail from 'src/features/User/Account/Management/Notiication/components/NotificationDetail';
import { ReactComponent as DashboardIcon } from 'src/assets/icon/sidebar/dashboard.svg';
import { ReactComponent as TradeHistoryIcon } from 'src/assets/icon/sidebar/trade-history.svg';
import { ReactComponent as AccountIcon } from 'src/assets/icon/sidebar/account.svg';
import routeConstants from 'src/constants/routeConstants';

interface IRoute {
  name: string;
  path: string;
  component: any;
  icon?: any;
  children?: IRoute[];
}

export const checkRenderSidebar = (path: string): boolean => {
  return !!['/user/dashboard', '/user/trade-history', '/user/account'].find((i) => path.indexOf(i) !== -1);
};

export const ROUTE_SIDEBAR = {
  account_dashboard_overview: '/user/dashboard/over-view',
  account_dashboard_balances: '/user/dashboard/balances',
  account_dashboard_profit_and_loss: '/user/dashboard/profit-and-loss',
  account_trade_history_open_orders: '/user/trade-history/open-orders',
  account_trade_history_order_history: '/user/trade-history/order-history',
  account_trade_history_trade_history: '/user/trade-history/trade-history',
  account_notification: '/user/account/notification',
  account_notification_detail: '/user/account/notification/:id',
  account_setting: '/user/account/setting',
};
export const notNavBar = [routeConstants.MAIN_TAIN, routeConstants.NOT_FOUND];
export const ROUTE_SIDEBAR_ACCOUNT = [
  {
    name: 'Dashboard',
    path: '/user/dashboard',
    component: Account,
    icon: DashboardIcon,
    children: [
      {
        name: 'Overview',
        path: ROUTE_SIDEBAR.account_dashboard_overview,
        component: OverView,
        icon: IconLibraryBooks,
      },
      {
        name: 'Balances',
        path: ROUTE_SIDEBAR.account_dashboard_balances,
        component: Balances,
        icon: IconLibraryBooks,
      },
      {
        name: 'Profit and loss',
        path: ROUTE_SIDEBAR.account_dashboard_profit_and_loss,
        component: ProfitAndLoss,
        icon: IconLibraryBooks,
      },
    ],
  },
  {
    name: 'Trade history',
    path: '/user/trade-history',
    component: Account,
    icon: TradeHistoryIcon,
    children: [
      {
        name: 'Open orders',
        path: ROUTE_SIDEBAR.account_trade_history_open_orders,
        component: OpenOrders,
        icon: IconLibraryBooks,
      },
      {
        name: 'Order history',
        path: ROUTE_SIDEBAR.account_trade_history_order_history,
        component: OrderHistory,
        icon: IconLibraryBooks,
      },
      {
        name: 'Trade history',
        path: ROUTE_SIDEBAR.account_trade_history_trade_history,
        component: TradeHistory,
        icon: IconLibraryBooks,
      },
    ],
  },
  {
    name: 'Account',
    path: '/user/account',
    component: Account,
    icon: AccountIcon,
    children: [
      {
        name: 'Notification',
        path: ROUTE_SIDEBAR.account_notification,
        component: AccountNotification,
        icon: IconLibraryBooks,
      },
      {
        name: 'Account settings',
        path: ROUTE_SIDEBAR.account_setting,
        component: AccountSetting,
        icon: IconLibraryBooks,
      },
    ],
  },
];

const OTHER_ROUTE_SIDEBAR = [
  {
    name: 'Notification Detail',
    path: ROUTE_SIDEBAR.account_notification_detail,
    component: NotificationDetail,
    icon: IconLibraryBooks,
  },
];

const convertRoute = ({ name, path }: IRoute) => ({ exact: true, name, path });

export const FLATTEN_SIDEBAR_ROUTE = [...ROUTE_SIDEBAR_ACCOUNT, ...OTHER_ROUTE_SIDEBAR].reduce(
  (total: any[], route: IRoute) => {
    const arr: any[] = [];
    !!route.children ? route.children.map((item: IRoute) => arr.push(convertRoute(item))) : convertRoute(route);
    return [...total, ...arr];
  },
  [],
);
export const checkNotNavBar = (route: string): boolean => {
  return notNavBar.filter((item) => route.indexOf(item) !== -1).length > 0;
};
