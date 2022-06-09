/* eslint-disable max-len */
import '@fontsource/roboto';
import { createBrowserHistory } from 'history';
import React, { useEffect } from 'react';
import { Route, useLocation } from 'react-router';
import { Switch } from 'react-router-dom';
import AccountDisabled from 'src/components/AccountDisabled';
import NavBar from 'src/components/Navigation';
import { getExchangeRates } from 'src/components/Navigation/redux/functionalCurrency.slice';
import CustomSnackbar from 'src/components/Snackbar';
import { checkRenderSidebar } from 'src/constants/accountSidebarRoute';
import AddressIsUsedWarning from 'src/features/ConnectWallet/components/AddressIsUsedWarining';
import ConnectWalletDialog from 'src/features/ConnectWallet/components/ConnectWalletDialog';
import ExtensionInstallationRequestWarning from 'src/features/ConnectWallet/components/ExtensionInstallationRequestDialog';
import StellarAccountIsNotActiveWarning from 'src/features/ConnectWallet/components/StellarAccountIsNotActiveWarning';
import WrongNetworkWarning from 'src/features/ConnectWallet/components/WrongNetworkWarning';
import CancelStellarOrder from 'src/features/OrderForm/components/CancelStellarOrder';
import OrderCannotBeExecutedWarning from 'src/features/OrderForm/components/OrderCannotBeExecutedWarning';
import WrongFreighterAccountWarning from 'src/features/OrderForm/components/WrongFreighterAccountWarning';
import WrongNetworkWarning2 from 'src/features/OrderForm/components/WrongNetWorkWarning2';
import { checkAuthRoute } from 'src/helpers/checkAuthRoute';
import { getCookieStorage } from 'src/helpers/storage';
import { THEME_MODE } from 'src/interfaces/theme';
import Sidebar from 'src/layouts/Sidebar';
import NotFound from 'src/pages/Maintain-Notfound/component/404';
import routers from 'src/routes/routes';
import { BaseSocket } from 'src/socket/BaseSocket';
import { setTheme } from 'src/store/theme/theme';
import 'src/styles/_app.scss';
import WhiteListWarningModal from './features/ConnectWallet/components/WhiteListWarningModal';
import { setOpenWarningModal } from './features/ConnectWallet/redux/wallet';
import { getCoinsApi } from './helpers/coinHelper/coin.slice';
import { getPairsApi } from './helpers/pairHelper/pair.slice';
import { getMe } from './store/auth';
import { useAppDispatch, useAppSelector } from './store/hooks';
import './styles/_app.scss';

export const browserHistory = createBrowserHistory();

const App: React.FC<any> = () => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isOpenModal = useAppSelector((state) => state.wallet.isOpenWarningModal);
  const accountDisabled = useAppSelector((state) => state.accountDisabled.open);

  const dispatch = useAppDispatch();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const location = useLocation();

  useEffect(() => {
    if (!checkAuthRoute(location.pathname)) {
      dispatch(setTheme(THEME_MODE.LIGHT));
    }
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (!currentUser.id && getCookieStorage('access_token')) {
      dispatch(getMe());
    }
    dispatch(getPairsApi());
    dispatch(getCoinsApi());
    dispatch(getExchangeRates());
    BaseSocket.getInstance().connect();
  }, []);

  return (
    <div className="App">
      <AccountDisabled open={accountDisabled} />
      <div className="Snackbar">
        <CustomSnackbar />
      </div>
      <div className="Navbar">
        <NavBar />
      </div>
      <div className="Content">
        <React.Suspense fallback={<div>....Loading</div>}>
          {checkRenderSidebar(location.pathname) && <Sidebar pathRoute={''} />}
          <Switch>
            {Object.keys(routers).map((key) => {
              //@ts-ignore
              const route = routers[key];
              return <route.route key={route.path} {...route} />;
            })}
            <Route path="*" component={NotFound} />
          </Switch>

          {/* warning in connect wallet*/}
          <WhiteListWarningModal
            open={isOpenModal}
            onClose={() => {
              dispatch(setOpenWarningModal(false));
            }}
          />
          <ConnectWalletDialog />
          <AddressIsUsedWarning />
          <ExtensionInstallationRequestWarning />
          <WrongNetworkWarning />
          <StellarAccountIsNotActiveWarning />
          {/* warning in order form*/}
          <CancelStellarOrder />
          <WrongNetworkWarning2 />
          <OrderCannotBeExecutedWarning />
          <WrongFreighterAccountWarning />
        </React.Suspense>
      </div>
    </div>
  );
};

export default App;
