import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { detailIconDark, detailIconLight } from 'src/assets/icon';
import { CSelect } from 'src/components/Base/Select';
import Donut from 'src/components/Chart/Donut';
import CLoading from 'src/components/Loading';
import { getVeloValuePerUsd } from 'src/components/Navigation/redux/functionalCurrency.slice';
import { ROUTE_SIDEBAR } from 'src/constants/accountSidebarRoute';
import { LIMIT_RECORD, ModeDisplay } from 'src/features/MyTransactions/Constant';
import { OpenOrder as OpenOrderComponent } from 'src/features/MyTransactions/OpenOrder';
import { CHART_NO_DATA, optionChartDonutDashboardOverview } from 'src/features/User/Account/constants/donut-chart';
import {
  convertValueUSDToCurSelector,
  convertValueToUSD,
  currentCurrenciesSelected,
  getBalancesInPools,
  getWalletStellar,
  reduceTotalAmountToken,
  renderDonutChartBalances,
  totalBalances,
} from 'src/features/User/Account/Dashboard/OverView/helper';
import styles from 'src/features/User/Account/Dashboard/OverView/OverView.module.scss';
import {
  BalancesInOrderRes,
  EnumFilterType,
  EnumFilterWallet,
  SeriesChartBalances,
} from 'src/features/User/Account/misc';
import { renderValueSelect } from 'src/features/User/Account/misc/helper';
import { renderAddressWallet } from 'src/features/User/helpers';
import { getAllBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { AllCoin } from 'src/interfaces/balance';
import { IResponseService } from 'src/interfaces/response';
import { THEME_MODE } from 'src/interfaces/theme';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import axiosInstance from 'src/services/config';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);
interface Props {
  screen: 'overview' | 'balances';
}

const OverView: React.FC<Props> = ({ screen = 'overview' }) => {
  const dispatch = useAppDispatch();
  const walletStore = useAppSelector((state) => state.wallet);
  const allCoins: AllCoin[] = useAppSelector((state) => state.allCoins.coins.data);
  const [balancesAll, setBalancesAll] = useState<SeriesChartBalances[]>([]);
  const [filterType, setFilterType] = useState<EnumFilterType>(EnumFilterType.All);
  const [filterWallet, setFilterWallet] = useState<string>(EnumFilterWallet.All);
  const [loading, setLoading] = useState(false);
  const theme = useAppSelector((state) => state.theme.themeMode);
  const selectedCurrencies = useAppSelector((state) => state.auth.currentUser.selectedFunctionalCurrencyId);
  const currenciesCurrentUser = useAppSelector(currentCurrenciesSelected);
  const veloValuePerUsd = useAppSelector((state) => state.functionalCurrency.veloValuePerUsd);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const functionalCurrencies = useAppSelector((state) => state.functionalCurrency.functionalCurrencies.data);

  const STELLAR_WALLET = useAppSelector(getWalletStellar);
  const BSC_WALLET = walletStore.bsc;

  useScrollToTop();

  useEffect(() => {
    dispatch(getVeloValuePerUsd());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const walletsParams = [STELLAR_WALLET, BSC_WALLET].filter((item) => !!item);
    const initBalances: SeriesChartBalances[] = [];
    if (isMounted && walletsParams.length) {
      setBalancesAll(() => []);
      (async () => {
        try {
          setLoading(true);
          if (!walletsParams.length) {
            setBalancesAll(() => []);
            return;
          }

          // In Order
          if (filterType === EnumFilterType.All || filterType === EnumFilterType.Order) {
            const resOrder: IResponseService<BalancesInOrderRes[]> = await axiosInstance.get(
              `/order/balances-in-order`,
              {
                params: { wallet: filterWallet === EnumFilterWallet.All ? walletsParams : filterWallet },
              },
            );
            if (resOrder.data?.length) {
              const resOrderMap = resOrder.data.map((item) => ({
                value: convertValueToUSD(
                  new BigNumber(item.value).toNumber(),
                  item.symbol,
                  exchangeRates,
                  functionalCurrencies,
                ),
                symbol: item.symbol,
              }));
              initBalances.push(...reduceTotalAmountToken(resOrderMap));
            }
          }

          // Available
          if (filterType === EnumFilterType.All || filterType === EnumFilterType.Available) {
            // Stellar => available = balances - selling_liabilities
            if (STELLAR_WALLET && filterWallet !== BSC_WALLET) {
              const availableStellar = await getAllBalanceInStellar(STELLAR_WALLET);
              const availableStellarMap = availableStellar.map((item) => ({
                value: convertValueToUSD(
                  new BigNumber(item.balance).minus(new BigNumber(item.selling_liabilities)).toNumber(),
                  item.asset_code,
                  exchangeRates,
                  functionalCurrencies,
                ),
                symbol: item.asset_code,
              }));
              initBalances.push(...reduceTotalAmountToken(availableStellarMap));
            }

            // BSC
            if (BSC_WALLET && filterWallet !== STELLAR_WALLET) {
              // if (BSC_WALLET && (filterWallet === EnumFilterWallet.All || filterWallet === BSC_WALLET)) {
              await Promise.all(
                allCoins.map((item: AllCoin) => getBalanceInBsc(BSC_WALLET, item.bsc_address, item.decimal)),
              ).then((values) => {
                const availableBSCMap = values.map((v, i) => ({
                  symbol: allCoins[i]?.symbol,
                  value: convertValueToUSD(
                    new BigNumber(v).toNumber(),
                    allCoins[i]?.symbol,
                    exchangeRates,
                    functionalCurrencies,
                  ),
                }));
                initBalances.push(...reduceTotalAmountToken(availableBSCMap));
              });
            }
          }

          // In Pools only BSC
          if (filterWallet !== STELLAR_WALLET && filterType === EnumFilterType.Pool) {
            const balancesPools = await getBalancesInPools(
              BSC_WALLET,
              allCoins.map((i) => i.symbol),
            );
            initBalances.push(...reduceTotalAmountToken(balancesPools.poolsAssetValue));
          }

          // LP Token only BSC
          if (
            filterWallet !== STELLAR_WALLET &&
            (filterType === EnumFilterType.All || filterType === EnumFilterType.LpToken)
          ) {
            const balancesPools = await getBalancesInPools(
              BSC_WALLET,
              allCoins.map((i) => i.symbol),
            );

            initBalances.push(...reduceTotalAmountToken(balancesPools.lpToken));
          }
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
          setBalancesAll(reduceTotalAmountToken(initBalances));
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [filterType, filterWallet, BSC_WALLET, STELLAR_WALLET]);

  const balancesShowMemo = useMemo(
    () =>
      balancesAll.map((i) => ({
        ...i,
        value: convertValueUSDToCurSelector(i.value, currenciesCurrentUser, exchangeRates),
      })),
    [selectedCurrencies, balancesAll],
  );

  useEffect(() => {
    setFilterWallet('all');
  }, [BSC_WALLET, STELLAR_WALLET]);

  return (
    <LayoutAccount screen={screen}>
      <div className={cx('info')}>
        <div className={cx('title')}>
          <h3>Balances</h3>
          <div className={cx('estimated-value')}>
            <div>Estimated value</div>
            <div className={cx('value')}>
              {loading ? (
                <CLoading type="text" size="sm" />
              ) : (
                `${currenciesCurrentUser.symbol} ${new BigNumber(totalBalances(balancesShowMemo)).toFormat()}`
              )}
            </div>
          </div>
          <div className={cx('acount')}>
            <div className={cx('acount-blance')}>Account balances </div>
            <div className={cx('cost')}>
              {loading ? (
                <CLoading type="text" size="sm" />
              ) : (
                `${new BigNumber(
                  new BigNumber(totalBalances(balancesShowMemo)).div(new BigNumber(veloValuePerUsd)).toFixed(4),
                ).toFormat()}`
              )}{' '}
              in VELO terms
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className={cx('chart')}>
          {loading ? (
            <CLoading type="spin" size="lg" />
          ) : (
            <Donut
              widthChart={!balancesShowMemo.length ? 260 : 360}
              options={{
                ...optionChartDonutDashboardOverview,
                colors: !balancesShowMemo.length ? ['#848E9C'] : optionChartDonutDashboardOverview.colors,
                legend: {
                  ...optionChartDonutDashboardOverview.legend,
                  show: !balancesShowMemo.length ? false : true,
                },
                tooltip: {
                  ...optionChartDonutDashboardOverview.tooltip,
                  enabled: !balancesShowMemo.length ? false : true,
                  y: {
                    formatter: (v: number) => `${new BigNumber(v).times(new BigNumber(100)).toFixed(2)}%`,
                  },
                },
                labels: !balancesShowMemo.length
                  ? CHART_NO_DATA.Label
                  : renderDonutChartBalances(balancesShowMemo).map((item) => item.symbol),
              }}
              series={
                !balancesShowMemo.length
                  ? CHART_NO_DATA.Value
                  : renderDonutChartBalances(balancesShowMemo).map((item) => item.value)
              }
            />
          )}
        </div>
        <div className={cx('select-form')}>
          <div className={cx('select-element')}>
            <label>Type: </label>
            <CSelect
              options={
                filterWallet === STELLAR_WALLET
                  ? [
                      { label: 'All', value: EnumFilterType.All },
                      { label: 'Available', value: EnumFilterType.Available },
                      { label: 'In order', value: EnumFilterType.Order },
                    ]
                  : [
                      { label: 'All', value: EnumFilterType.All },
                      { label: 'Available', value: EnumFilterType.Available },
                      { label: 'In order', value: EnumFilterType.Order },
                      { label: 'In pool', value: EnumFilterType.Pool },
                      { label: 'FPT', value: EnumFilterType.LpToken },
                    ]
              }
              defaultValue={{ value: EnumFilterType.All, label: 'All' }}
              onChange={(value: EnumFilterType) => {
                setFilterType(value);
              }}
            />
          </div>
          <div className={cx('select-element')}>
            <label>Wallet: </label>
            <CSelect
              options={
                [EnumFilterType.Pool, EnumFilterType.LpToken].includes(filterType)
                  ? [
                      { label: 'All', value: EnumFilterWallet.All },
                      { label: renderAddressWallet(BSC_WALLET), value: BSC_WALLET },
                    ].filter((item) => item.value)
                  : [
                      { label: 'All', value: EnumFilterWallet.All },
                      { label: renderAddressWallet(BSC_WALLET), value: BSC_WALLET },
                      {
                        label: renderAddressWallet(STELLAR_WALLET),
                        value: STELLAR_WALLET,
                      },
                    ].filter((item) => item.value)
              }
              defaultValue={{ value: EnumFilterWallet.All, label: 'All' }}
              value={renderValueSelect(filterWallet)}
              onChange={(value: EnumFilterWallet) => setFilterWallet(value)}
            />
          </div>
        </div>
        {screen === 'overview' && (
          <div className={cx('detail')}>
            <div
              style={{
                margin: '10px 20px',
                padding: '5px 20px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Link style={{ color: 'var(--active-tab)', fontSize: 14 }} to={ROUTE_SIDEBAR.account_dashboard_balances}>
                Details
              </Link>
              <img style={{ marginLeft: 4 }} src={theme === THEME_MODE.LIGHT ? detailIconLight : detailIconDark}></img>
            </div>
          </div>
        )}
      </div>

      {screen === 'overview' && (
        <div className={cx('orders')}>
          <div>
            <div className={cx('orders-body')}>
              <div className={cx('orders-title')}>Open Order</div>
              <div style={{ paddingLeft: 10 }}>
                <OpenOrderComponent
                  modeDisplay={ModeDisplay.user}
                  limitRecord={LIMIT_RECORD}
                  currentScreen="balances"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutAccount>
  );
};

export default OverView;
