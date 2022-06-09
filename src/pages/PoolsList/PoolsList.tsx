import { ButtonBase, Container, createMuiTheme, ThemeProvider } from '@material-ui/core';
import { GridColDef, GridRowParams, GridSortModel, GridValueFormatterParams } from '@material-ui/data-grid';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { FC, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { CButton } from 'src/components/Base/Button';
import { CSelect } from 'src/components/Base/Select';
import { COLOR_CHART } from 'src/components/Chart/constant';
import Donut from 'src/components/Chart/Donut';
import CleanNumber from 'src/components/CleanNumber';
import CDataGrid from 'src/components/DataGrid';
import { CustomLoadingOverlay, NoRows } from 'src/components/DataGrid/DataGrid';
import Pagination from 'src/components/Pagination';
import { routeConstants } from 'src/constants';
import { calcAPY } from 'src/features/PoolsInfo/helpers/apy';
import {
  formatCurrencyAmount,
  formatPoolNumber,
  formatPoolPercent,
  setDataPrecision,
} from 'src/features/PoolsInfo/helpers/dataFormatter';
import { currencySelector } from 'src/helpers/functional-currency';
import { Pool, PoolInfo, PoolType, Token } from 'src/interfaces/pool';
import { THEME_MODE } from 'src/interfaces/theme';
import WarningPopup from 'src/pages/PoolRequest/components/WarningPopup';
import { countPoolRequest } from 'src/pages/PoolRequest/PoolRequest.slice';
import { getPoolList } from 'src/services/pool';
import { useAppSelector } from 'src/store/hooks';
import PoolSearch from './components/PoolSearch';
import TokenSearch from './components/TokenSearch';
import { FEE_TYPE, PER_PAGE } from './constants';
import styles from './PoolList.module.scss';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import { ReactComponent as PlusIcon } from 'src/assets/icon/plus3.svg';
import { TooltipAddress } from 'src/features/User/Account/Dashboard/components/TooltipAddress';
import { renderAddressWallet } from 'src/features/User/helpers';
const cx = classnames.bind(styles);

const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
  },
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

const PoolsList: FC<any> = (props: any) => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const wallet = useAppSelector((state) => state.wallet);
  const coins = useAppSelector((state) => state.allCoins.coins.data);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const [rawPools, setRawPools] = useState<Pool[]>([]);
  const [myRawPools, setMyRawPools] = useState<Pool[]>([]);
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [poolsPage, setPoolsPage] = useState(0);
  const [myPools, setMyPools] = useState<PoolInfo[]>([]);
  const [myPoolsPage, setMyPoolsPage] = useState(0);
  const [poolType, setPoolType] = useState(PoolType.Fixed);
  const [feeType, setFeeType] = useState(FEE_TYPE.GROSS);
  const [searchToken, setSearchToken] = useState<string>('');
  const [searchPoolAddress, setSearchPoolAddress] = useState<string>('');
  const [poolRequestNumber, setPoolRequestNumber] = useState(-1);
  const [openMaxPoolWarning, setOpenMaxPoolWarning] = useState(false);
  const [loadingPools, setLoadingPools] = useState(false);
  const [loadingMyPools, setLoadingMyPools] = useState(false);

  const { history } = props;

  interface ChartLegend {
    symbol: string;
    value: string;
  }

  const columns: GridColDef[] = [
    {
      field: 'poolAddress',
      sortable: false,
      headerName: 'Pool address',
      flex: 1,
      renderCell: (params) => (
        <TooltipAddress title={params.row.poolAddress}>
          <span>{renderAddressWallet(params.row.poolAddress)}</span>
        </TooltipAddress>
      ),
    },
    {
      field: 'assets',
      sortable: false,
      headerName: 'Digital credits',
      width: 300,
      renderCell: (params: GridValueFormatterParams) => {
        const chart = params.row.assets[0];
        const legend = params.row.assets[1];
        return (
          <>
            <Donut
              series={chart.map((item: Token) => new BigNumber(item.denormWeight).toNumber())}
              colors={chart.map((item: Token) => COLOR_CHART[item.symbol])}
              widthChart={35}
            ></Donut>
            <div className={cx('assets')}>
              {legend.map((item: ChartLegend, key: number) => {
                return (
                  <div className={cx('assets__item')} key={key}>
                    <span style={{ color: COLOR_CHART[item.symbol], marginRight: '5px' }}>•</span>
                    {`${item.value} ${item.symbol}`}
                  </div>
                );
              })}
            </div>
          </>
        );
      },
    },
    { field: 'swapFee', sortable: false, headerName: 'Swap fee', flex: 0.8 },
    {
      field: 'totalLiquidity',
      sortable: false,
      headerName: 'Total liquidity',
      flex: 1,
    },
    {
      field: 'myLiquidity',
      sortable: false,
      headerName: 'My liquidity',
      valueFormatter: (params: GridValueFormatterParams) => {
        return formatCurrencyAmount(Number(params.value), selectedCurrency, exchangeRates);
      },
      sortComparator: (v1, v2, param1, param2) => {
        return new BigNumber(String(param1.value)).minus(new BigNumber(String(param2.value))).toNumber();
      },
      flex: 1,
    },
    { field: 'volume24', sortable: false, headerName: 'Volume (24h)', flex: 1 },
    { field: 'fees24', sortable: false, headerName: 'Fees (24h)', flex: 1 },
    {
      field: 'apy',
      sortable: false,
      headerName: 'APY',
      renderCell: (params: GridValueFormatterParams) => {
        return (
          <>
            <CleanNumber number={new BigNumber(params.value as string | number)} maxDigits={8} fixedDecimal={2} />{' '}
            {isNaN(params.value as number) ? '' : '%'}
          </>
        );
      },
      flex: 0.8,
    },
    {
      field: 'lifeTimeFees',
      sortable: false,
      headerName: 'Life time fees',
      flex: 1,
    },
    {
      field: 'numberOfLPer',
      sortable: false,
      headerName: 'Number of LPer',
      flex: 1,
    },
  ];

  const getPoolsData = async (myPoolOnly: boolean): Promise<Pool[]> => {
    if (myPoolOnly && !wallet.bsc) {
      return [];
    }
    const rawPools = await getPoolList(poolType, myPoolOnly, wallet.bsc, searchToken, searchPoolAddress);

    return rawPools;
  };

  const formatPool = (pool: Pool, index: number): PoolInfo => {
    // get total weight
    const assetsWeightTotal = pool.tokens.reduce((total, cur) => {
      return total + parseInt(cur.denormWeight);
    }, 0);

    // calculate percentage of each token
    const assets = pool.tokens.map((item) => {
      return {
        symbol: item.symbol,
        value: `${formatPoolNumber((parseInt(item.denormWeight) / assetsWeightTotal) * 100)}%`,
      };
    });

    let volumeIn24h = '0';
    let fees24h = '0';
    const poolTotalFee = feeType === FEE_TYPE.GROSS ? 'totalSwapFee' : 'totalNetFee';
    const feeRate = feeType === FEE_TYPE.GROSS ? 'swapFee' : 'netFee';
    const swapTotalFee = feeType === FEE_TYPE.GROSS ? 'poolTotalSwapFee' : 'poolTotalNetFee';
    let swapFeeLast24h = '0';
    if (pool.swaps?.length) {
      swapFeeLast24h = pool.swaps[0][swapTotalFee];
    }
    fees24h = new BigNumber(pool[poolTotalFee]).minus(swapFeeLast24h).toString();
    volumeIn24h = new BigNumber(pool.totalSwapVolume).minus(pool.swaps[0]?.poolTotalSwapVolume || 0).toString();

    const apy =
      new BigNumber(pool.liquidity).gt(0) && !calcAPY(fees24h, pool.liquidity).eq(0)
        ? setDataPrecision(calcAPY(fees24h, pool.liquidity), 2)
        : '-';

    return {
      id: index,
      poolAddress: pool.id,
      assets: [pool.tokens, assets],
      swapFee: `${formatPoolPercent(pool[feeRate], 2, '0')}%`,
      totalLiquidity: formatCurrencyAmount(pool.liquidity, selectedCurrency, exchangeRates),
      myLiquidity: pool.myLiquidity,
      volume24: formatCurrencyAmount(volumeIn24h, selectedCurrency, exchangeRates),
      fees24: formatCurrencyAmount(fees24h, selectedCurrency, exchangeRates),
      lifeTimeFees: formatCurrencyAmount(pool[poolTotalFee], selectedCurrency, exchangeRates),
      apy: apy,
      numberOfLPer: pool.shares.length,
    };
  };

  const handleFeeTypeChange = (e: number) => {
    setFeeType(e);
  };

  useEffect(() => {
    (async () => {
      setPoolRequestNumber(await countPoolRequest());
    })();
    disableDragDrop('data-grid');
  }, []);

  useEffect(() => {
    (async () => {
      await setLoadingMyPools(true);
      await getPoolsData(true).then((pools) => setMyRawPools(pools));
      await getPoolsData(false).then((pools) => setRawPools(pools));
      await setLoadingMyPools(false);
    })();
  }, [poolType, wallet.bsc, searchToken, searchPoolAddress]);

  useEffect(() => {
    (async () => {
      await setLoadingPools(true);
      await getPoolsData(false).then((pools) => setRawPools(pools));
      await setLoadingPools(false);
    })();
  }, [poolType, searchToken, searchPoolAddress]);

  useEffect(() => {
    setPoolsPage(0);
    setPools(rawPools.map((pool: Pool, index: number) => formatPool(pool, index)));
  }, [rawPools]);

  useEffect(() => {
    setPools(rawPools.map((pool: Pool, index: number) => formatPool(pool, index)));
  }, [feeType, selectedCurrency, exchangeRates]);

  useEffect(() => {
    setMyPoolsPage(0);
    setMyPools(myRawPools.map((pool: Pool, index: number) => formatPool(pool, index)));
  }, [myRawPools]);

  useEffect(() => {
    setMyPools(myRawPools.map((pool: Pool, index: number) => formatPool(pool, index)));
  }, [feeType, selectedCurrency, exchangeRates]);

  const onRowClickHandler = (row: GridRowParams) => {
    history.push(`/pools/${row.getValue(row.id, 'poolAddress')}`);
  };

  const sortModel: GridSortModel = [{ field: 'myLiquidity', sort: 'desc' }];

  return (
    <>
      <Container className={cx('container')}>
        <div className={cx('header')}>
          <div className={cx('header__left')}>
            <div className={cx('type-buttons')}>
              <ButtonBase
                className={poolType == PoolType.Fixed ? cx('type-buttons--active') : ''}
                onClick={() => setPoolType(PoolType.Fixed)}
              >
                Fixed
              </ButtonBase>
              <ButtonBase
                className={poolType == PoolType.Flexible ? cx('type-buttons--active') : ''}
                onClick={() => setPoolType(PoolType.Flexible)}
              >
                Flexible
              </ButtonBase>
            </div>
            <TokenSearch
              data={coins.map((item: { [key: string]: any }) => {
                return { symbol: item.symbol, address: item.bsc_address };
              })}
              setSearchToken={setSearchToken}
              theme={theme}
            />
            <PoolSearch setSearchToken={setSearchPoolAddress} theme={theme} />

            <div style={{ marginLeft: 16 }}>
              <CSelect
                options={[
                  { label: 'Gross fee', value: 1 },
                  { label: 'Net fee', value: 2 },
                ]}
                className={cx('fee')}
                onChange={handleFeeTypeChange}
                defaultValue={{ label: 'Gross fee', value: 1 }}
              />
            </div>
          </div>

          <CButton
            classNamePrefix={cx('request-btn')}
            size="sm"
            type="success"
            prepend={<PlusIcon width="20" height="20" />}
            content="Request new pool"
            isDisabled={poolRequestNumber === -1}
            onClick={() =>
              poolRequestNumber >= 10 ? setOpenMaxPoolWarning(true) : history.push(routeConstants.POOL_REQUEST)
            }
          />

          <WarningPopup open={openMaxPoolWarning} handleClose={() => setOpenMaxPoolWarning(false)} />
        </div>
        {myPools.length > 0 && (
          <div id="data-grid">
            <h2>MY POOLS</h2>
            <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
              <CDataGrid
                page={myPoolsPage}
                rows={myPools}
                columns={columns}
                sortModel={sortModel}
                pageSize={PER_PAGE}
                hideFooterRowCount
                hideFooterSelectedRowCount
                disableColumnReorder={true}
                disableColumnMenu
                autoHeight
                components={{
                  Pagination,
                  NoRowsOverlay: NoRows,
                  LoadingOverlay: CustomLoadingOverlay,
                }}
                componentsProps={{
                  noRowsOverlay: {
                    text: 'Not found',
                  },
                }}
                rowHeight={80}
                headerHeight={44}
                onRowClick={onRowClickHandler}
                onPageChange={(params) => {
                  window.scrollTo({
                    top: 0,
                  });

                  setMyPoolsPage(params.page);
                }}
                loading={loadingMyPools}
              />
            </ThemeProvider>
          </div>
        )}
        <h2>POOLS</h2>
        <ThemeProvider theme={theme == THEME_MODE.LIGHT ? lightTheme : darkTheme}>
          <CDataGrid
            page={poolsPage}
            rows={pools}
            columns={columns}
            pageSize={PER_PAGE}
            hideFooterRowCount
            hideFooterSelectedRowCount
            disableSelectionOnClick={true}
            autoHeight
            disableColumnMenu
            components={{
              Pagination,
              NoRowsOverlay: NoRows,
              LoadingOverlay: CustomLoadingOverlay,
            }}
            componentsProps={{
              noRowsOverlay: {
                text:
                  feeType === FEE_TYPE.GROSS && searchToken === '' && searchPoolAddress === ''
                    ? 'No record'
                    : 'Not found',
              },
            }}
            rowHeight={80}
            headerHeight={44}
            onRowClick={onRowClickHandler}
            onPageChange={(params) => setPoolsPage(params.page)}
            loading={loadingPools}
          />
        </ThemeProvider>
      </Container>
    </>
  );
};

export default withRouter(PoolsList);
