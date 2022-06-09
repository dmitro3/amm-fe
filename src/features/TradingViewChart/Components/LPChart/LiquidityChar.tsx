import { ApexOptions } from 'apexcharts';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Spline from 'src/components/Chart/Spline';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { formatCurrencyAmount } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { currencySelector } from 'src/helpers/functional-currency';
import { fetchPairSwaps } from 'src/helpers/pool';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { SwapPairData } from 'src/interfaces/pool';
import { THEME_MODE } from 'src/interfaces/theme';
import { FunctionCurrency } from 'src/interfaces/user';
import { useAppSelector } from 'src/store/hooks';
import { RootState } from 'src/store/store';

function getOptions(
  theme = 'light',
  categories: string[],
  currency: FunctionCurrency,
  exchangeRates: ExchangeRate[],
): ApexOptions {
  const options: ApexOptions = {
    chart: {
      width: '100%',
      height: 300,
      type: 'area',
      toolbar: { show: false },
      foreColor: theme == 'dark' ? '#848E9C' : '#4E4B66',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      type: 'category',
      categories: categories,
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
        formatter: function (value) {
          return formatCurrencyAmount(value, currency, exchangeRates, '0');
        },
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
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 1,
        gradientToColors: ['rgba(174, 136, 255, 0) 99.9%'],
        stops: [0, 100],
      },
    },
  };

  return options;
}

interface Props {
  id: string;
  interval: number;
  heightChart?: number;
}

interface ChartData {
  series: {
    name: string;
    data: string[];
  }[];
  categories: string[];
}

const LiquidityChart: FC<Props> = ({ interval, heightChart }) => {
  const selectedPair: Pair | undefined = useAppSelector((state) => state.pair.selectedPair);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const [swaps, setSwaps] = useState<SwapPairData[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    series: [
      {
        name: 'Liquidity',
        data: [],
      },
    ],
    categories: [],
  });

  useEffect(() => {
    setSwaps([]);
    if (!selectedPair) return;

    fetchPairSwaps(selectedPair, interval).then((swaps) => setSwaps(swaps));
  }, [interval, selectedPair]);

  useEffect(() => {
    const format = interval >= 24 * 60 ? 'DD' : 'HH:mm';
    const data: string[] = [];
    const categories: string[] = [];
    for (const swap of swaps) {
      data.push(swap.pairLiquidity);
      categories.push(moment(swap.timestamp).format(format));
    }

    const series = [
      {
        name: 'Liquidity',
        data: data,
      },
    ];

    setChartData({ series, categories });
  }, [swaps]);

  const theme: THEME_MODE = useSelector((state: RootState) => state.theme.themeMode);
  const options = getOptions(theme, chartData.categories, selectedCurrency, exchangeRates);

  return <Spline series={chartData.series} options={options} height={heightChart} />;
};

export default LiquidityChart;
