/* eslint-disable max-len */
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import orderReducer from 'src/features/MyTransactions/MyTransactions.slice';
import slippageToleranceReducer from 'src/features/SlippageTolerance/redux/slippageTolerance';
import themeReducer from './theme/theme';
import walletReducer from 'src/features/ConnectWallet/redux/wallet';
import pairReducer from 'src/features/Pairs/redux/pair';
import authReducer from 'src/store/auth';
import accountDiabledSliceReducer from 'src/store/accountDisabled';
// eslint-disable-next-line max-len
import tradingReducer from 'src/components/Navigation/redux/tradingMethods.slice';
import orderbookReducer from 'src/features/Orderbook/redux/orderbook.slice';
import marketTradeReducer from 'src/features/MarketTrade/redux/MarketTrade.slice';
import functionalCurrencyReducer from 'src/components/Navigation/redux/functionalCurrency.slice';
import userReducer from 'src/features/User/redux/user.slice';
import transactionsReducer from 'src/features/Trasactions/redux/transactions.slice';
import chartReducer from 'src/features/TradingViewChart/Components/redux/ChartRedux.slide';
import notificationReducer from 'src/features/User/Account/Management/Notiication/redux/notification.slice';
import poolRequestReducer from 'src/pages/PoolRequest/PoolRequest.slice';
import snackbarReducer from 'src/store/snackbar';
import allCoinReducer from 'src/helpers/coinHelper/coin.slice';
import allPairReducer from 'src/helpers/pairHelper/pair.slice';
import dashboardReducer from 'src/pages/Dashboard/redux/dashboard.slice';
import sorReducer from 'src/features/SOR/redux/sor';
import orderFormReducer from 'src/features/OrderForm/redux/orderForm';

const store = configureStore({
  reducer: {
    snackbar: snackbarReducer,
    theme: themeReducer,
    myTransaction: orderReducer,
    orderbook: orderbookReducer,
    marketTrade: marketTradeReducer,
    wallet: walletReducer,
    pair: pairReducer,
    allPairs: allPairReducer,
    allCoins: allCoinReducer,
    auth: authReducer,
    trading: tradingReducer,
    functionalCurrency: functionalCurrencyReducer,
    user: userReducer,
    transactions: transactionsReducer,
    chart: chartReducer,
    notification: notificationReducer,
    poolRequest: poolRequestReducer,
    accountDisabled: accountDiabledSliceReducer,
    sor: sorReducer,
    dashboard: dashboardReducer,
    orderForm: orderFormReducer,
    slippage: slippageToleranceReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
  devTools: false,
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
//Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export default store;
