import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { CSelect } from 'src/components/Base/Select';
import Donut from 'src/components/Chart/Donut';
import CustomDateRangePicker, { IDate } from 'src/components/DateRangePicker';
import { CHART_NO_DATA, optionChartDonutDashboardOverview } from 'src/features/User/Account/constants/donut-chart';
import TooltipHelp from 'src/features/User/Account/Dashboard/components/TooltipHelp';
import {
  convertValueToUSD,
  convertValueUSDToCurSelector,
  currentCurrenciesSelected,
  getBalancesInPools,
  getWalletStellar,
  reduceTotalAmountToken,
  renderDonutChartBalances,
  totalBalances,
} from 'src/features/User/Account/Dashboard/OverView/helper';
import styles from 'src/features/User/Account/Dashboard/ProfitAndLoss/ProfitAndLoss.module.scss';
import {
  BalancesInOrderRes,
  IPnl,
  IPnlResponse,
  IPnlsLiquidityResponse,
  ISelectedDate,
  SeriesChartBalances,
} from 'src/features/User/Account/misc';
import { TITLE_TOOLTIP } from 'src/features/User/Account/misc/constant';
import {
  convertTimeSubmit,
  formatCurrencyAmount,
  getFirstValueBalance,
  qsStringRemoveFalsy,
  reduceTotalBalancesByDate,
  renderDateSubmit,
  returnPnlFromTotalBalancesByDate,
  setTimeUTC,
} from 'src/features/User/Account/misc/helper';
import { renderAddressWallet } from 'src/features/User/helpers';
import { addTimeJS, subTimeJS } from 'src/helpers/date';
import { currencySelector } from 'src/helpers/functional-currency';
import { getAllBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import useScrollToTop from 'src/hooks/useScrollToTop';
import { AllCoin } from 'src/interfaces/balance';
import { IResponseService } from 'src/interfaces/response';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import axiosInstance from 'src/services/config';
import { useAppSelector } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { ColumnPnl, LinePnl } from './ChartPnl';
import { DEFAULT_PNL, IPnlConstant, PnlType } from './misc';

const IS_COLOR = {
  true: true,
  false: false,
};
const IS_PERCENT = {
  true: true,
  false: false,
};

const isDateUTCEqualDateTimezone =
  new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours();
const addDayForUTCTime = (x: number) => {
  return isDateUTCEqualDateTimezone ? x : x + 1;
};

const cx = classnames.bind(styles);
const DEFAULT_SELECTED_DATE = {
  from: convertTimeSubmit(subTimeJS(new Date(), addDayForUTCTime(7), 'day')).getTime(),
  to: convertTimeSubmit(subTimeJS(new Date(), addDayForUTCTime(1), 'day')).getTime(),
};

const ProfitAndLoss: React.FC = () => {
  const dispatch = useDispatch();
  const STELLAR_WALLET = useAppSelector(getWalletStellar);
  const currenciesCurrentUser = useAppSelector(currentCurrenciesSelected);
  const allCoins: AllCoin[] = useAppSelector((state) => state.allCoins.coins.data);
  const BSC_WALLET = useAppSelector((state) => state.wallet.bsc);
  const veloValuePerUsd = useAppSelector((state) => state.functionalCurrency.veloValuePerUsd);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const functionalCurrencies = useAppSelector((state) => state.functionalCurrency.functionalCurrencies.data);
  const selectedCurrency = useAppSelector(currencySelector);

  const WALLET_ADD = [STELLAR_WALLET, BSC_WALLET].filter((item) => !!item);
  const [walletsParams, setWalletParams] = useState(WALLET_ADD);
  const [filterWallet, setFilterWallet] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>(PnlType.Trading);
  const [selectedDate, setSelectedDate] = useState<ISelectedDate>(DEFAULT_SELECTED_DATE);
  const [assetAllocation, setAssetAllocation] = useState<SeriesChartBalances[]>([]);
  const [isShowPnl, setIsShowPnl] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [pnl, setPnl] = useState<IPnl[]>([]);
  const [pnlConstant, setPnlConstant] = useState<IPnlConstant>({
    yesterday: 0,
    rateChangePnlYesterday: 0,
    thirtyDaysAgo: 0,
    rateChangePnl30DayAgo: 0,
  });

  const returnDateChart = (from: Date, to: Date) => {
    const totalDate = (to.getTime() - from.getTime()) / 86400000;
    const arr = [renderDateSubmit(from)];
    for (let i = 0; i < totalDate; i++) {
      arr.push(renderDateSubmit(addTimeJS(from, 1, 'day')));
    }
    return arr;
  };

  const returnDataChartPnl = (arrDateLabel: string[], arrDataPnlChart: IPnl[]): IPnl[] => {
    return arrDateLabel.reduce((total: IPnl[], date: string, index: number) => {
      if (arrDataPnlChart.every((i) => renderDateSubmit(new Date(i.date)) !== date)) {
        total.push(
          index === 0
            ? {
                ...DEFAULT_PNL,
                date: date,
              }
            : {
                ...DEFAULT_PNL,
                date: date,
                balance_value: total[index - 1].balance_value,
                pnlCommulativeAmount: total[index - 1].pnlCommulativeAmount,
              },
        );
      } else {
        total.push(
          arrDataPnlChart.find((i) => renderDateSubmit(new Date(i.date)) === date) || {
            ...DEFAULT_PNL,
            date: date,
            balance_value: total[index - 1].balance_value,
            pnlCommulativeAmount: total[index - 1].pnlCommulativeAmount,
          },
        );
      }
      return total;
    }, []);
  };

  const returnValueCommulativePnlPercent = (pnl: IPnl[]) => {
    return (
      new BigNumber(
        new BigNumber(pnl[pnl.length - 1]?.pnlCommulativeAmount)
          .div(
            new BigNumber(getFirstValueBalance(pnl)).plus(
              pnl.reduce(
                (t, i) =>
                  new BigNumber(t).plus(new BigNumber(i.transfer_value).div(new BigNumber(pnl.length))).toNumber(),
                0,
              ),
            ),
          )
          .times(100)
          .toFixed(2),
      ).toNumber() || 0
    );
  };

  useScrollToTop();

  useEffect(() => {
    if (new Date().getHours() >= setTimeUTC(0).getHours() && new Date().getHours() < setTimeUTC(2).getHours()) {
      setIsShowPnl(false);
    } else setIsShowPnl(true);
  }, []);

  useEffect(() => {
    if (filterMethod === PnlType.Trading) {
      setWalletParams(WALLET_ADD);
    }
    if (filterMethod === PnlType.AddedLiquidity) {
      setWalletParams([BSC_WALLET]);
    }
  }, [filterMethod, BSC_WALLET, STELLAR_WALLET]);

  useEffect(() => {
    let isMounted = true;
    setPnl(() => []);
    if (!walletsParams.length) {
      setPnl(() => []);
    }

    const dateLabel = returnDateChart(new Date(selectedDate.from), new Date(selectedDate.to));
    if (isMounted && filterWallet) {
      (async () => {
        try {
          setLoading(true);

          let pnlRes: IPnlResponse[] = [];
          // trading
          if (filterMethod === PnlType.Trading) {
            const pnlsTradeApi: IResponseService<IPnlResponse[]> = await axiosInstance.get('/users/pnl', {
              params: qsStringRemoveFalsy({
                from: subTimeJS(convertTimeSubmit(new Date(selectedDate.from)), 1, 'day').getTime(),
                to: addTimeJS(convertTimeSubmit(new Date(selectedDate.to)), 1, 'day').getTime(),
                wallet: filterWallet,
              }),
            });
            pnlRes = pnlsTradeApi.data;
          }

          // liquidity
          if (filterWallet === BSC_WALLET && filterMethod === PnlType.AddedLiquidity) {
            const pnls: IResponseService<IPnlsLiquidityResponse[]> = await axiosInstance.get('/users/pool-pnl', {
              params: qsStringRemoveFalsy({
                from: subTimeJS(convertTimeSubmit(new Date(selectedDate.from)), 1, 'day').getTime(),
                to: addTimeJS(convertTimeSubmit(new Date(selectedDate.to)), 1, 'day').getTime(),
                wallet: filterWallet,
              }),
            });
            pnlRes = pnls.data.map((i) => ({
              balance: `${new BigNumber(i.balance).times(new BigNumber(i.price))}`,
              created_at: i.created_at,
              date: i.date,
              rate: '1',
              symbol: i.symbol,
              trade_amount: '0',
              transfer_amount: `${new BigNumber(i.transfer_amount).times(new BigNumber(i.price))}`,
              updated_at: i.updated_at,
              user_id: i.user_id,
              wallet: i.wallet,
            }));
          }
          const returnDataChartByDate = returnDateChart(
            subTimeJS(convertTimeSubmit(new Date(selectedDate.from)), 1, 'day'),
            addTimeJS(convertTimeSubmit(new Date(selectedDate.to)), 1, 'day'),
          ).map((i) => {
            const findItem = reduceTotalBalancesByDate(pnlRes).find(
              (item) => renderDateSubmit(new Date(item.date)) === renderDateSubmit(new Date(i)),
            ) || {
              date: i,
              wallet: filterWallet,
              balance_value: 0,
              trade_value: 0,
              transfer_value: 0,
            };
            return findItem;
          });

          setPnl(returnDataChartPnl(dateLabel, returnPnlFromTotalBalancesByDate(returnDataChartByDate)));
        } catch (error) {
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedDate.from, selectedDate.to, filterMethod, filterWallet]);

  // calc asset allocation
  useEffect(() => {
    let mounted = true;
    const initBalances: SeriesChartBalances[] = [];
    setAssetAllocation(() => []);
    if (mounted && filterWallet) {
      (async () => {
        try {
          setLoading(true);
          if (filterMethod === PnlType.Trading) {
            const resOrder: IResponseService<BalancesInOrderRes[]> = await axiosInstance.get(
              `/order/balances-in-order`,
              {
                params: { wallet: filterWallet },
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

            // Stellar => available = balances - selling_liabilities
            if (filterWallet === STELLAR_WALLET) {
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
            if (filterWallet === BSC_WALLET) {
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
          if (filterMethod === PnlType.AddedLiquidity) {
            const balancesPools = await getBalancesInPools(
              filterWallet,
              allCoins.map((i) => i.symbol),
            );
            initBalances.push(...reduceTotalAmountToken(balancesPools.poolsAssetValue));
          }
        } catch (error) {
        } finally {
          setAssetAllocation(reduceTotalAmountToken(initBalances));
          setLoading(false);
        }
      })();
    }

    return () => {
      mounted = false;
    };
  }, [selectedDate.from, selectedDate.to, filterMethod, filterWallet]);

  // Calc params header : Yesterday, 30 days ago
  useEffect(() => {
    let isMounted = true;
    // calc pnl for trading
    const dateLabel = returnDateChart(
      new Date(subTimeJS(new Date(), addDayForUTCTime(30), 'day')),
      new Date(subTimeJS(new Date(), addDayForUTCTime(1), 'day')),
    );
    if (filterWallet && filterWallet === STELLAR_WALLET && filterMethod === PnlType.AddedLiquidity) {
      dispatch(
        openSnackbar({
          message: 'Wallet is not BSC Network.',
          variant: SnackbarVariant.ERROR,
        }),
      );
      return;
    }
    if (isMounted && filterWallet) {
      // calc pnl for trading
      (async () => {
        setLoading(true);
        try {
          let pnlsDataHeader: IPnlResponse[] = [];
          if (filterMethod === PnlType.Trading) {
            const pnlsTradeApi: IResponseService<IPnlResponse[]> = await axiosInstance.get('/users/pnl', {
              params: qsStringRemoveFalsy({
                from: subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(30), 'day').getTime(),
                to: addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day').getTime(),
                wallet: filterWallet,
              }),
            });
            pnlsDataHeader = pnlsTradeApi.data;
          }

          // calc pnl for liquidity
          if (filterWallet === BSC_WALLET && filterMethod === PnlType.AddedLiquidity) {
            const pnlsTradeApi: IResponseService<IPnlsLiquidityResponse[]> = await axiosInstance.get(
              '/users/pool-pnl',
              {
                params: qsStringRemoveFalsy({
                  from: subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(30), 'day').getTime(),
                  to: addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day').getTime(),
                  wallet: filterWallet,
                }),
              },
            );
            pnlsDataHeader = pnlsTradeApi.data.map((i) => ({
              balance: `${new BigNumber(i.balance).times(new BigNumber(i.price))}`,
              created_at: i.created_at,
              date: i.date,
              rate: '1',
              symbol: i.symbol,
              trade_amount: '0',
              transfer_amount: `${new BigNumber(i.transfer_amount).times(new BigNumber(i.price))}`,
              updated_at: i.updated_at,
              user_id: i.user_id,
              wallet: i.wallet,
            }));
          }

          const return30DaysAgoByDate = returnDateChart(
            subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(30), 'day'),
            addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day'),
          ).map((i) => {
            const findItem = reduceTotalBalancesByDate(pnlsDataHeader).find(
              (item) => renderDateSubmit(new Date(item.date)) === renderDateSubmit(new Date(i)),
            ) || {
              date: i,
              wallet: filterWallet,
              balance_value: 0,
              trade_value: 0,
              transfer_value: 0,
            };
            return findItem;
          });
          const returnYtdDataByDate = returnDateChart(
            subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(2), 'day'),
            addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day'),
          ).map((i) => {
            const findItem = reduceTotalBalancesByDate(pnlsDataHeader).find(
              (item) => renderDateSubmit(new Date(item.date)) === renderDateSubmit(new Date(i)),
            ) || {
              date: i,
              wallet: filterWallet,
              balance_value: 0,
              trade_value: 0,
              transfer_value: 0,
            };
            return findItem;
          });

          const pnlDataYtd = returnDataChartPnl(dateLabel, returnPnlFromTotalBalancesByDate(returnYtdDataByDate));
          const pnlData30DaysAgo = returnDataChartPnl(
            dateLabel,
            returnPnlFromTotalBalancesByDate(return30DaysAgoByDate),
          );

          const pnlYesterday =
            pnlDataYtd.find(
              (i) =>
                renderDateSubmit(new Date(i.date)) ===
                renderDateSubmit(subTimeJS(new Date(), addDayForUTCTime(1), 'day')),
            )?.pnlDaily || 0;
          setPnlConstant((pnl) => ({
            ...pnl,
            yesterday: pnlYesterday,
            rateChangePnlYesterday: returnValueCommulativePnlPercent(pnlDataYtd),
          }));

          // pnl 30day ago
          const pnl30DaysAgo =
            pnlData30DaysAgo.find(
              (i) =>
                renderDateSubmit(new Date(i.date)) ===
                renderDateSubmit(subTimeJS(new Date(), addDayForUTCTime(1), 'day')),
            )?.pnlCommulativeAmount || 0;
          setPnlConstant((pnl) => ({
            ...pnl,
            thirtyDaysAgo: pnl30DaysAgo,
            rateChangePnl30DayAgo: returnValueCommulativePnlPercent(pnlData30DaysAgo),
          }));
        } catch (error) {
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [filterWallet, filterMethod]);

  const pnlMemo = useMemo(
    () =>
      pnl.map((i) => {
        return {
          ...i,
          balance_value: convertValueUSDToCurSelector(i.balance_value, currenciesCurrentUser, exchangeRates),
          trade_value: convertValueUSDToCurSelector(i.trade_value, currenciesCurrentUser, exchangeRates),
          transfer_value: convertValueUSDToCurSelector(i.transfer_value, currenciesCurrentUser, exchangeRates),

          pnlDaily: convertValueUSDToCurSelector(i.pnlDaily, currenciesCurrentUser, exchangeRates),
          pnlCommulativeAmount: convertValueUSDToCurSelector(
            i.pnlCommulativeAmount,
            currenciesCurrentUser,
            exchangeRates,
          ),
        };
      }),
    [pnl, currenciesCurrentUser.id],
  );

  const pnlConstantMemo = useMemo(
    () => ({
      ...pnlConstant,
      yesterday: convertValueUSDToCurSelector(pnlConstant.yesterday, currenciesCurrentUser, exchangeRates),
      thirtyDaysAgo: convertValueUSDToCurSelector(pnlConstant.thirtyDaysAgo, currenciesCurrentUser, exchangeRates),
    }),
    [pnlConstant, currenciesCurrentUser.id],
  );
  const assetAllocationMemo = useMemo(
    () =>
      assetAllocation.map((i) => ({
        ...i,
        value: convertValueUSDToCurSelector(i.value, currenciesCurrentUser, exchangeRates),
      })),
    [assetAllocation, currenciesCurrentUser.id],
  );

  const renderValueProfitAndLoss = (value: number, isPercent = IS_PERCENT.false, isColor = IS_COLOR.false) => {
    return (
      <span className={cx(isColor ? (value > 0 ? 'text-success' : value < 0 ? 'text-error' : 'text-normal') : '')}>{`${
        !isNaN(value)
          ? `${value > 0 ? '+' : value < 0 ? '-' : ''}${!isPercent ? currenciesCurrentUser.symbol : ''}${new BigNumber(
              new BigNumber(value).abs(),
            ).toFormat()}`
          : 0
      }${isPercent ? '%' : ''}`}</span>
    );
  };

  const formatValueCommulativePersent = (arr: IPnl[]): number[] => {
    return arr.map((item) => {
      const itemFormatted = new BigNumber(
        new BigNumber(item.pnlCommulativeAmount)
          .div(
            new BigNumber(getFirstValueBalance(pnl))
              .plus(pnl.reduce((t, i) => t + i.transfer_value / pnl.length, 0))
              .toNumber(),
          )
          .times(100)
          .toFixed(2),
      ).toNumber();

      return Number.isNaN(itemFormatted) ? 0 : itemFormatted;
    });
  };

  const formatterYAxis = (value: number) => {
    return formatCurrencyAmount(value, selectedCurrency, '0');
  };

  return (
    <LayoutAccount>
      <div className={cx('header')}>
        <h3>
          Profit and loss{' '}
          <span style={{ marginLeft: 4 }}>
            <TooltipHelp title={TITLE_TOOLTIP.profitAndLoss} />
          </span>
        </h3>

        <div className={cx('select-form')}>
          <div className={cx('select-element')}>
            <label>Type: </label>
            <CSelect
              options={
                filterWallet.includes('0x') || !WALLET_ADD.length || !filterWallet
                  ? [
                      { value: PnlType.Trading, label: 'Trading' },
                      { value: PnlType.AddedLiquidity, label: 'Added liquidity' },
                    ]
                  : [{ value: PnlType.Trading, label: 'Trading' }]
              }
              defaultValue={{ value: PnlType.Trading, label: 'Trading' }}
              onChange={(v: string) => setFilterMethod(v)}
            />
          </div>
          <div className={cx('select-element')}>
            <label>Wallet: </label>
            <CSelect
              placeholder="Wallet"
              options={
                filterMethod === PnlType.AddedLiquidity
                  ? [
                      ...walletsParams.map((item) => ({
                        label: renderAddressWallet(item),
                        value: item,
                      })),
                    ].filter((item) => item.value && !item.value.includes('0x'))
                  : [
                      ...walletsParams.map((item) => ({
                        label: renderAddressWallet(item),
                        value: item,
                      })),
                    ].filter((item) => item.value)
              }
              onChange={(value: string) => setFilterWallet(value)}
            />
          </div>
        </div>
      </div>

      <div className={cx('info-account')}>
        <div className={cx('info-element')}>
          <div>
            <div>{filterMethod === PnlType.Trading ? 'Account balance' : 'Liquidity'}</div>
            {filterWallet && isShowPnl ? (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {`${new BigNumber(
                    new BigNumber(totalBalances(assetAllocationMemo)).div(new BigNumber(veloValuePerUsd)).toFixed(2),
                  ).toFormat()}`}{' '}
                  in VELO terms
                  <span className={cx('txt-small')}>
                    ~{' '}
                    {`${currenciesCurrentUser.symbol} ${new BigNumber(totalBalances(assetAllocationMemo)).toFormat()}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {'--'}
                  <span className={cx('txt-small')}>{'--'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={cx('info-element')}>
          <div>
            <div>Yesterday PNL</div>
            {filterWallet && isShowPnl && isDateUTCEqualDateTimezone ? (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {renderValueProfitAndLoss(
                    new BigNumber(new BigNumber(pnlConstantMemo.yesterday).toFixed(2)).toNumber(),
                  )}
                  <span className={cx('txt-small')}>
                    {renderValueProfitAndLoss(
                      new BigNumber(new BigNumber(pnlConstantMemo.rateChangePnlYesterday).toFixed(2)).toNumber(),
                      IS_PERCENT.true,
                      IS_COLOR.true,
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {'--'}
                  <span className={cx('txt-small')}>{'--'}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <div>30 days PNL</div>
            {filterWallet && isShowPnl ? (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {renderValueProfitAndLoss(
                    new BigNumber(new BigNumber(pnlConstantMemo.thirtyDaysAgo).toFixed(2)).toNumber(),
                  )}
                  <span className={cx('txt-small')}>
                    {renderValueProfitAndLoss(
                      new BigNumber(new BigNumber(pnlConstantMemo.rateChangePnl30DayAgo).toFixed(2)).toNumber(),
                      IS_PERCENT.true,
                      IS_COLOR.true,
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {'--'}
                  <span className={cx('txt-small')}>{'--'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 0', pointerEvents: filterWallet ? 'auto' : 'none' }}>
        <CustomDateRangePicker
          classNameProps={'fix-style-date-range'}
          activeSelected={!!pnl.length}
          showOptionDate
          monthDisplayFormat="MMMM yyyy"
          onChange={(v: IDate) => {
            setSelectedDate({
              from: convertTimeSubmit(new Date(v.startDate)).getTime(),
              to: convertTimeSubmit(new Date(v.endDate)).getTime(),
            });
          }}
          maxDate={
            new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours()
              ? subTimeJS(new Date(), 1, 'day')
              : subTimeJS(new Date(), 2, 'day')
          }
          minDate={subTimeJS(new Date(), 1, 'year')}
        />
      </div>

      {loading || !isShowPnl ? (
        <div className={cx('no-data')}>Your Profit and Loss is currently recalculated. Please wait for some time.</div>
      ) : (
        <div>
          {!filterWallet ? (
            <div className={cx('no-data')}>No record</div>
          ) : (
            <div className={cx('chart')}>
              <div style={{ flex: 1, paddingRight: 15 }}>
                {/* Cummulative % */}
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info', 'absolute-info')}>
                    <div className={cx('chart-element__info--value')}>
                      {renderValueProfitAndLoss(
                        returnValueCommulativePnlPercent(pnlMemo),
                        IS_PERCENT.true,
                        IS_COLOR.true,
                      )}
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Cumulative PNL(%)
                      <span style={{ marginLeft: 4 }}>
                        <TooltipHelp title={TITLE_TOOLTIP.commulativePNLPersent} />
                      </span>
                    </div>
                  </div>

                  <LinePnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Cumulative PNL(%)',
                        data: formatValueCommulativePersent(pnlMemo),
                      },
                      {
                        name: 'Cumulative VELO trend',
                        data: formatValueCommulativePersent(
                          pnlMemo.map((i) => ({
                            ...i,
                            pnlCommulativeAmount: new BigNumber(i.pnlCommulativeAmount)
                              .div(new BigNumber(veloValuePerUsd))
                              .toNumber(),
                            transfer_value: new BigNumber(i.transfer_value)
                              .div(new BigNumber(veloValuePerUsd))
                              .toNumber(),
                          })),
                        ),
                      },
                    ]}
                  />
                </div>

                {/* Daily PNL */}
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--value')}>
                      {renderValueProfitAndLoss(
                        new BigNumber(new BigNumber(pnlMemo[pnlMemo.length - 1]?.pnlDaily).toFixed(2)).toNumber() || 0,
                        IS_PERCENT.false,
                        IS_COLOR.true,
                      )}
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Daily PNL
                      <span style={{ marginLeft: 4 }}>
                        <TooltipHelp title={TITLE_TOOLTIP.dailyPNL} />
                      </span>
                    </div>
                  </div>
                  <ColumnPnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Daily PNL',
                        data: pnlMemo.map((item) => new BigNumber(item.pnlDaily.toFixed(2)).toNumber()),
                      },
                    ]}
                    formatterYAxis={formatterYAxis}
                  />
                </div>

                {/* Profit */}
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--value')}>
                      {renderValueProfitAndLoss(
                        new BigNumber(
                          new BigNumber(pnlMemo[pnlMemo.length - 1]?.pnlCommulativeAmount).toFixed(2),
                        ).toNumber() || 0,
                        IS_PERCENT.false,
                        IS_COLOR.true,
                      )}
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Profits
                      <span style={{ marginLeft: 4 }}>
                        <TooltipHelp title={TITLE_TOOLTIP.profit} />
                      </span>
                    </div>
                  </div>
                  <LinePnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Profit',
                        data: pnlMemo.map((item) => new BigNumber(item.pnlCommulativeAmount.toFixed(2)).toNumber()),
                      },
                    ]}
                    formatterYAxis={formatterYAxis}
                  />
                </div>
              </div>

              <div style={{ flex: 1, paddingLeft: 15 }}>
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--sub-value')}>
                      Asset Allocation
                      <span style={{ marginLeft: 4 }}>
                        <TooltipHelp title={TITLE_TOOLTIP.assetAllocation} />
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Donut
                      widthChart={!assetAllocationMemo.length ? 260 : 360}
                      options={{
                        ...optionChartDonutDashboardOverview,
                        colors: !assetAllocationMemo.length ? ['#848E9C'] : optionChartDonutDashboardOverview.colors,
                        legend: {
                          ...optionChartDonutDashboardOverview.legend,
                          show: !assetAllocationMemo.length ? false : true,
                        },
                        tooltip: {
                          enabled: !assetAllocationMemo.length ? false : true,
                          y: {
                            formatter: (v: number) => `${new BigNumber(v).times(new BigNumber(100)).toFixed(2)}%`,
                          },
                        },
                        labels: !assetAllocationMemo.length
                          ? CHART_NO_DATA.Label
                          : renderDonutChartBalances(assetAllocationMemo).map((item) => item.symbol),
                      }}
                      series={
                        !assetAllocationMemo.length
                          ? CHART_NO_DATA.Value
                          : renderDonutChartBalances(assetAllocationMemo).map((item) => item.value)
                      }
                    />
                  </div>
                </div>
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--value')}>
                      <span className={cx('text-normal')}>
                        {`${currenciesCurrentUser.symbol}${new BigNumber(
                          pnlMemo[pnlMemo.length - 1]?.balance_value.toFixed(2),
                        ).toFormat()}`}
                      </span>
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Asset Net Worth
                      <span style={{ marginLeft: 4 }}>
                        <TooltipHelp title={TITLE_TOOLTIP.assetNetWorth} />
                      </span>
                    </div>
                  </div>
                  <LinePnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Asset Net Worth',
                        data: pnlMemo.map((item) => new BigNumber(item.balance_value.toFixed(2)).toNumber()),
                      },
                    ]}
                    formatterYAxis={formatterYAxis}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </LayoutAccount>
  );
};

export default React.memo(ProfitAndLoss);
