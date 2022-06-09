import { Box, Tab, Tabs } from '@material-ui/core';
import { ApexOptions } from 'apexcharts';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Column from 'src/components/Chart/Column';
import Spline from 'src/components/Chart/Spline';
import CLoading from 'src/components/Loading';
import { formatCurrencyAmount } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { currencySelector } from 'src/helpers/functional-currency';
import {
  DAY_IN_MILLISECONDS,
  fetchPoolAdds,
  fetchPoolSwaps,
  fetchPoolVirtualSwaps,
  fetchPoolWithdrawals,
  formatChartTime,
  getTickCount,
} from 'src/helpers/pool';
import { PoolAdd, PoolSwap, PoolVirtualSwap, PoolWithdrawal } from 'src/interfaces/pool';
import { THEME_MODE } from 'src/interfaces/theme';
import { FEE_TYPE } from 'src/pages/PoolsList/constants';
import { useAppSelector } from 'src/store/hooks';
import { RootState } from 'src/store/store';
import { TabsLabel } from '../../constants/charts';
import styles from './Charts.module.scss';
import TimeInterval from './TimeInterval';

const cx = classnames.bind(styles);
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && <Box height="100%">{children}</Box>}
    </div>
  );
};

const tabLabels = [
  { label: 'Liquidity' },
  { label: 'Add' },
  { label: 'Remove' },
  { label: 'Volume' },
  { label: 'Fee returns (percentage)' },
  { label: 'Fee returns (value)' },
];

const barCharts = [TabsLabel.VOLUME, TabsLabel.ADD, TabsLabel.REMOVE];

function getOptions(
  tab: number,
  theme = 'light',
  categories: string[],
  formatter: (value: number) => string,
): ApexOptions {
  let fill;
  let stroke = {};
  let plotOptions = {};
  let states = {};
  if (barCharts.includes(tab)) {
    fill = {
      colors: ['#1A88C9'],
    };

    plotOptions = {
      bar: {
        columnWidth: '96%',
      },
    };

    states = {
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
    };
  } else {
    fill = {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 1,
        gradientToColors: ['rgba(174, 136, 255, 0) 99.9%'],
        stops: [0, 100],
      },
    };

    stroke = {
      curve: 'smooth',
      width: 4,
    };
  }
  return {
    chart: {
      width: '100%',
      height: 300,
      type: 'area',
      animations: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      categories: categories,
      labels: {
        show: true,
        rotate: 0,
        style: {
          colors: 'var(--color-body)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      opposite: true,
      labels: {
        show: true,
        style: {
          colors: 'var(--color-body)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        formatter: formatter,
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      theme: theme,
    },
    grid: {
      show: false,
    },
    fill,
    stroke,
    plotOptions: plotOptions,
    states: states,
  };
}

interface Props {
  poolId: string;
  feeType: number;
  shouldUpdateData: boolean;
  setShouldUpdateData: (v: boolean) => void;
}

interface ChartData {
  series: {
    name: string;
    data: string[];
  }[];
  categories: string[];
}

const Charts: FC<Props> = ({ poolId, feeType, shouldUpdateData, setShouldUpdateData }) => {
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = React.useState(0);
  const [interval, setInterval] = useState(DAY_IN_MILLISECONDS);
  const [swaps, setSwaps] = useState<PoolSwap[]>([]);
  const [adds, setAdds] = useState<PoolAdd[]>([]);
  const [withdrawals, setWithdrawals] = useState<PoolWithdrawal[]>([]);
  const [virtualSwaps, setVirtualSwaps] = useState<PoolVirtualSwap[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    series: [
      {
        name: 'volume',
        data: [],
      },
    ],
    categories: [],
  });
  const theme: THEME_MODE = useSelector((state: RootState) => state.theme.themeMode);
  const handleChange = (event: React.ChangeEvent<Record<string, never>>, newTab: number) => {
    if (newTab !== tab) {
      setTab(newTab);
    }
  };

  const fetchData = async () => {
    await setLoading(true);
    const tickCount = getTickCount(interval);
    Promise.all([
      fetchPoolSwaps(poolId, interval, tickCount + 1),
      fetchPoolAdds(poolId, interval, tickCount + 1),
      fetchPoolWithdrawals(poolId, interval, tickCount + 1),
      fetchPoolVirtualSwaps(poolId, interval, tickCount + 1),
    ]).then(([swaps, adds, withdrawals, virtualSwap]) => {
      setSwaps(swaps);
      setAdds(adds);
      setWithdrawals(withdrawals);
      setVirtualSwaps(virtualSwap);
    });
    await setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [poolId, interval]);

  useEffect(() => {
    if (shouldUpdateData) {
      fetchData().then(() => {
        setShouldUpdateData(false);
      });
    }
  }, [shouldUpdateData]);

  const getLiquidityItem = (
    swaps: PoolSwap[],
    adds: PoolAdd[],
    withdrawals: PoolWithdrawal[],
    virtualSwaps: PoolVirtualSwap[],
    index: number,
  ): PoolSwap | PoolAdd | PoolWithdrawal | PoolVirtualSwap => {
    let item: PoolSwap | PoolAdd | PoolWithdrawal | PoolVirtualSwap = swaps[index];
    if (index < adds.length && item.updatedAt < adds[index].updatedAt) {
      item = adds[index];
    }
    if (index < withdrawals.length && item.updatedAt < withdrawals[index].updatedAt) {
      item = withdrawals[index];
    }
    if (index < virtualSwaps.length && item.updatedAt <= virtualSwaps[index].updatedAt) {
      item = virtualSwaps[index];
    }
    return item;
  };

  useEffect(() => {
    const data: string[] = [];
    const categories: string[] = [];
    const feeFieldName = feeType === FEE_TYPE.GROSS ? 'poolTotalSwapFee' : 'poolTotalNetFee';
    switch (tab) {
      case TabsLabel.LIQUIDITY:
        for (let i = 1; i < swaps.length; i++) {
          const item = getLiquidityItem(swaps, adds, withdrawals, virtualSwaps, i);
          data.push(item.poolLiquidity);
          categories.push(formatChartTime(item.timestamp, interval));
        }
        break;
      case TabsLabel.ADD:
        for (let i = 1; i < adds.length; i++) {
          data.push(new BigNumber(adds[i].poolTotalAddVolume).minus(adds[i - 1].poolTotalAddVolume).toString());
          categories.push(formatChartTime(adds[i].timestamp, interval));
        }
        break;
      case TabsLabel.REMOVE:
        for (let i = 1; i < withdrawals.length; i++) {
          data.push(
            new BigNumber(withdrawals[i].poolTotalWithdrawVolume)
              .minus(withdrawals[i - 1].poolTotalWithdrawVolume)
              .toString(),
          );
          categories.push(formatChartTime(withdrawals[i].timestamp, interval));
        }
        break;
      case TabsLabel.VOLUME:
        for (let i = 1; i < swaps.length; i++) {
          data.push(new BigNumber(swaps[i].poolTotalSwapVolume).minus(swaps[i - 1].poolTotalSwapVolume).toString());
          categories.push(formatChartTime(swaps[i].timestamp, interval));
        }
        break;
      case TabsLabel.FEE_PERCENTAGE:
        for (let i = 1; i < swaps.length; i++) {
          const fee = new BigNumber(swaps[i][feeFieldName]).minus(swaps[i - 1][feeFieldName]);
          const feeInYear = fee.times(365).times(DAY_IN_MILLISECONDS).div(interval);
          const liquidityItem = getLiquidityItem(swaps, adds, withdrawals, virtualSwaps, i);
          let feePercentage = '0';
          const liquidity = liquidityItem.poolLiquidity;
          if (new BigNumber(liquidity).gt('0')) {
            feePercentage = feeInYear.times('100').div(liquidity).toString();
          }
          data.push(feePercentage);
          categories.push(formatChartTime(liquidityItem.timestamp, interval));
        }
        break;
      case TabsLabel.FEE_VALUE:
        for (let i = 1; i < swaps.length; i++) {
          data.push(new BigNumber(swaps[i][feeFieldName]).minus(swaps[i - 1][feeFieldName]).toString());
          categories.push(formatChartTime(swaps[i].timestamp, interval));
        }
        break;
    }

    const series = [
      {
        name: tabLabels[tab].label,
        data: data,
      },
    ];

    setChartData({ series, categories });
  }, [swaps, adds, withdrawals, virtualSwaps, tab, feeType, selectedCurrency, exchangeRates]);

  const formatter = function (value: number) {
    if (tab === TabsLabel.FEE_PERCENTAGE) {
      return `${value.toFixed(2)}%`;
    } else {
      return formatCurrencyAmount(value, selectedCurrency, exchangeRates, '0');
    }
  };
  const options = getOptions(tab, theme, chartData.categories, formatter);
  return (
    <>
      <div className={cx('charts')}>
        <Box width="100%" display="flex" justifyContent="space-between">
          <Tabs value={tab} onChange={handleChange}>
            {tabLabels.map((item, index) => {
              return <Tab label={item.label} key={index} />;
            })}
          </Tabs>
          <TimeInterval onIntervalSelected={setInterval} />
        </Box>
        <Box className={cx('charts-content')}>
          {loading && (
            <div className={cx('loading')}>
              <CLoading type="spin" size="md" />
            </div>
          )}
          {tabLabels.map((_, index) => {
            if (barCharts.includes(tab))
              return (
                <TabPanel value={tab} index={index} key={index}>
                  <Column series={chartData.series} options={options} />
                </TabPanel>
              );
            else
              return (
                <TabPanel value={tab} index={index} key={index}>
                  <Spline series={chartData.series} options={options} />
                </TabPanel>
              );
          })}
        </Box>
      </div>
    </>
  );
};

export default Charts;
