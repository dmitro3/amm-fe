import { ApexOptions } from 'apexcharts';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Column from 'src/components/Chart/Column';
import eventBus from 'src/event/event-bus';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { formatCurrencyAmount } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { currencySelector } from 'src/helpers/functional-currency';
import { fetchPairSwaps } from 'src/helpers/pool';
import { sleep } from 'src/helpers/share';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { SwapPairData } from 'src/interfaces/pool';
import { THEME_MODE } from 'src/interfaces/theme';
import { FunctionCurrency } from 'src/interfaces/user';
import { SocketEvent } from 'src/socket/SocketEvent';
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
      animations: {
        enabled: false,
      },
      type: 'area',
      toolbar: { show: false },
      foreColor: theme == 'dark' ? '#848E9C' : '#4E4B66',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      offsetX: 0,
      offsetY: -20,
      enabled: true,
      formatter: function (value: string, {}) {
        return formatCurrencyAmount(value, currency, exchangeRates, '0');
      },
      style: {
        colors: ['#4f4f4f'],
      },
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
        maxWidth: 160 + Math.floor(Math.random() * 100), // force rerender chart
        formatter: (value): string => {
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
      colors: ['#3888C9'],
    },
  };

  return options;
}

interface Props {
  id: string;
  interval: number;
  volumeHeightChart?: number;
}

interface ChartData {
  series: {
    name: string;
    data: string[];
  }[];
  categories: string[];
}

const VolumeChart: FC<Props> = ({ interval, volumeHeightChart }) => {
  const selectedPair: Pair | undefined = useAppSelector((state) => state.pair.selectedPair);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const [swaps, setSwaps] = useState<SwapPairData[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    series: [
      {
        name: 'Volume',
        data: [],
      },
    ],
    categories: [],
  });
  const selectedPairRef = useRef<Pair>();
  const intervalRef = useRef<number>(interval);
  const swapsRef = useRef<SwapPairData[]>([]);

  selectedPairRef.current = selectedPair;
  intervalRef.current = interval;
  swapsRef.current = swaps;

  useEffect(() => {
    setSwaps([]);
    if (!selectedPair) return;

    fetchPairSwaps(selectedPair, interval).then((swaps) => setSwaps(swaps));
  }, [interval, selectedPair]);

  useEffect(() => {
    eventBus.on(SocketEvent.SwapCreated, () => {
      const selectedPair = selectedPairRef.current;
      const interval = intervalRef.current;
      if (!selectedPair) return;

      fetchPairSwaps(selectedPair, interval).then((swaps) => setSwaps(swaps));
    });
  }, []);

  useEffect(() => {
    const addNewBar = async () => {
      while (true) {
        await sleep(15000);
        const swaps = swapsRef.current;
        const interval = intervalRef.current * 60 * 1000;
        if (!swaps.length) continue;

        const lastSwap = swaps[swaps.length - 1];
        const now = Date.now();
        if (now > lastSwap.timestamp + interval) {
          const newSwap = { ...lastSwap };
          newSwap.timestamp = lastSwap.timestamp + interval;
          swaps.push(newSwap);
          swaps.shift();
          setSwaps([...swaps]);
        }
      }
    };
    addNewBar().then();
  }, []);

  useEffect(() => {
    const format = interval >= 24 * 60 ? 'DD' : 'HH:mm';
    const data: string[] = [];
    const categories: string[] = [];
    for (let i = 1; i < swaps.length; i++) {
      data.push(new BigNumber(swaps[i].pairSwapVolume).minus(swaps[i - 1].pairSwapVolume).toString());
      categories.push(moment(swaps[i].timestamp).format(format));
    }

    const series = [
      {
        name: 'Volume',
        data: data,
      },
    ];

    setChartData({ series, categories });
  }, [swaps]);

  const theme: THEME_MODE = useSelector((state: RootState) => state.theme.themeMode);
  const options = getOptions(theme, chartData.categories, selectedCurrency, exchangeRates);

  return <Column series={chartData.series} options={options} height={volumeHeightChart} />;
};

export default VolumeChart;
