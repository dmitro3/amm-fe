import BigNumber from 'bignumber.js';
import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import {
  IBasicDataFeed,
  IChartingLibraryWidget,
  ThemeName,
  TradingTerminalWidgetOptions,
  widget,
} from 'src/charting_library/charting_library.min';
import { barsUrl, SYMBOL_TYPE } from 'src/components/Chart/constant';
import { TradingMethod } from 'src/constants/dashboard';
import eventBus from 'src/event/event-bus';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import LiquidityChart from 'src/features/TradingViewChart/Components/LPChart/LiquidityChar';
import VolumeChart from 'src/features/TradingViewChart/Components/LPChart/VolumeChart';
import NabarTradingView from 'src/features/TradingViewChart/Components/NabarTradingView';
import {
  addTradeToLastCandle,
  createEmptyCandleIfNeeded,
  DEFAULT_TRADING_VIEW_INTERVAL,
  getClientTimezone,
  getClientTimezoneValue,
  getInterval,
  getIntervalString,
  getSymbol,
  round,
} from 'src/features/TradingViewChart/helpers';
import style from 'src/features/TradingViewChart/styles/TradingViewPool.module.scss';
import { makeApiRequest } from 'src/helpers/ChartHelper';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppSelector } from 'src/store/hooks';

interface obj {
  [key: string]: boolean | number | string;
}
interface Props {
  containerId: string;
  symbol?: string;
  libraryPath?: string;
  chartsStorageUrl?: string;
  chartsStorageApiVersion?: '1.0' | '1.1';
  clientId?: string;
  userId?: string;
  fullscreen?: boolean;
  autosize?: boolean;
  studiesOverrides?: obj;
  className?: string;
  setFullScreen: (flag: boolean) => void;
  height?: number;
}

interface Candle {
  close: number;
  high: number;
  low: number;
  time: number;
  open: number;
  volume: number;
}

const cx = classNames.bind(style);
const configurationData = {
  supports_search: true,
  supports_marks: true,
  supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'],
};

const TradingViewPool: React.FC<Props> = (props) => {
  const [tradingViewChart, setTradingViewChart] = useState<IChartingLibraryWidget>();
  // const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const selectedPair: Pair | undefined = useAppSelector((state) => state.pair.selectedPair);
  // const tradingMethodsRef = useRef<TradingMethod[]>();
  const [isChartReady, setChartReady] = useState(false);
  const pairRef = useRef<Pair>();
  const lastCandleRef = useRef<Candle>({} as Candle);
  const intervalInMillisecondsRef = useRef<number>(getInterval(DEFAULT_TRADING_VIEW_INTERVAL) * 60 * 1000);
  const theme = useAppSelector((state) => state.theme.themeMode);
  const tradingViewTheme = (theme.charAt(0).toUpperCase() + theme.slice(1)) as ThemeName;
  const setFullScreen = (flag: boolean) => {
    props.setFullScreen(flag);
  };

  pairRef.current = selectedPair;

  const [tabActive, setTabActive] = useState({
    isLiquidityActive: false,
    isVolumeActive: false,
    isPriceActive: true,
  });

  let chartRealtimeCallback: (candle: Candle) => void;
  const [interval, setInterval] = useState(getInterval(DEFAULT_TRADING_VIEW_INTERVAL));
  const listDisableChartWithEvrypool = [
    'header_widget',
    'display_market_status',
    'timeframes_toolbar',
    'edit_buttons_in_legend',
    'left_toolbar',
    'create_volume_indicator_by_default',
    'legend_context_menu',
  ];

  intervalInMillisecondsRef.current = interval * 60 * 1000;
  const onReady = (callback: any) => {
    setTimeout(() => callback(configurationData));
  };
  const getBars = async (symbolInfo: any, resolution: string, from: number, to: number, onHistoryCallback: any) => {
    const intervalInSeconds = getInterval(resolution) * 60;
    const startTime = round(from, intervalInSeconds) * 1000;
    const endTime = round(to + intervalInSeconds, intervalInSeconds) * 1000;
    const clientTimezone = getClientTimezoneValue();
    try {
      const urlParameters = {
        interval: intervalInSeconds,
        startTime,
        endTime,
        pairId: pairRef.current?.pairs_id,
        network: [TradingMethod.BSCPool],
        timezone: clientTimezone,
      };
      const data = await makeApiRequest(barsUrl, urlParameters);
      if (data.length === 0) {
        onHistoryCallback([], {
          noData: true,
        });
        return;
      }
      const bars: any = data.map((bar: any) => ({
        time: bar.time,
        close: parseFloat(bar.close),
        open: parseFloat(bar.open),
        high: parseFloat(bar.high),
        low: parseFloat(bar.low),
      }));
      lastCandleRef.current = bars[bars.length - 1];
      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      // onErrorCallback(error);
      onHistoryCallback([], { noData: true });
    }
  };

  const resolveSymbol = async (
    symbolName: any,
    onSymbolResolvedCallback: any,
    // onResolveErrorCallback: any,
  ) => {
    const selectedPair = pairRef.current;
    const symbol = `${selectedPair?.base_symbol}/${selectedPair?.quote_symbol}`;
    const priceScale = selectedPair ? new BigNumber(1).div(selectedPair.price_precision).toNumber() : 100000;
    // log(amount_precision) * (fee precision)
    const volumePrecision = -Math.log10(Number(selectedPair?.amount_precision || 0.01)) + 2;
    const symbolInfo = {
      ticker: symbol,
      name: symbol,
      description: symbol,
      type: SYMBOL_TYPE.bitcoin,
      session: '24x7',
      timezone: getClientTimezone(),
      minmov: 1,
      pricescale: priceScale,
      has_intraday: true,
      has_weekly_and_monthly: true,
      intraday_multipliers: ['1', '60'],
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: volumePrecision,
    };
    onSymbolResolvedCallback(symbolInfo);
  };

  const subscribeBars = (symbolInfo: any, resolution: any, onRealtimeCallback: any) => {
    chartRealtimeCallback = onRealtimeCallback;
    eventBus.remove(SocketEvent.PoolTradeCreated);
    eventBus.on(SocketEvent.PoolTradeCreated, (trades: any) => {
      const intervalInMilliseconds = intervalInMillisecondsRef.current;
      const selectedPair = pairRef.current;
      trades.forEach((trade: any) => {
        if (trade.method === TradingMethod.BSCPool && trade.pair_id === selectedPair?.pairs_id) {
          lastCandleRef.current = addTradeToLastCandle(
            trade,
            lastCandleRef.current,
            intervalInMilliseconds,
            chartRealtimeCallback,
          );
        }
      });
    });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      const lastCandle = lastCandleRef.current;
      const intervalInMilliseconds = intervalInMillisecondsRef.current;
      lastCandleRef.current = createEmptyCandleIfNeeded(lastCandle, intervalInMilliseconds, chartRealtimeCallback);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const datafeed: IBasicDataFeed = {
    onReady,
    searchSymbols: () => {},
    resolveSymbol,
    getBars,
    subscribeBars,
    unsubscribeBars: () => {},
  };

  useEffect(() => {
    const widgetOptions: TradingTerminalWidgetOptions = {
      symbol: getSymbol(selectedPair),
      datafeed: datafeed,
      interval: DEFAULT_TRADING_VIEW_INTERVAL,
      container_id: props.containerId,
      library_path: props.libraryPath,
      locale: 'en',
      timezone: getClientTimezone(),
      disabled_features: listDisableChartWithEvrypool,
      enabled_features: ['study_templates'],
      charts_storage_url: props.chartsStorageUrl,
      charts_storage_api_version: props.chartsStorageApiVersion,
      client_id: props.clientId,
      user_id: props.userId,
      autosize: true,
      studies_overrides: props.studiesOverrides,
      theme: tradingViewTheme,
    };
    const chart = new widget(widgetOptions);
    setTradingViewChart(chart);
    chart.onChartReady(() => {
      setChartReady(true);
      chart.chart().setResolution(getIntervalString(interval), () => {});
      chart.applyOverrides({ 'paneProperties.topMargin': 15 });
    });
  }, []);

  useEffect(() => {
    if (isChartReady && selectedPair) {
      const symbol = getSymbol(selectedPair);
      tradingViewChart?.chart().setSymbol(symbol, () => {});
    }
  }, [isChartReady, selectedPair]);

  useEffect(() => {
    if (isChartReady) {
      tradingViewChart?.changeTheme(tradingViewTheme);
    }
  }, [isChartReady, theme]);

  const selectInterval = (value: number) => {
    setInterval(value);
  };

  useEffect(() => {
    if (isChartReady) {
      tradingViewChart?.chart().setResolution(getIntervalString(interval), () => {});
    }
  }, [isChartReady, interval]);

  const selectTab = (status: any) => {
    setTabActive(status);
  };
  return (
    <div className={cx('tradingview-parent')}>
      <NabarTradingView
        onSelectInterval={selectInterval}
        containerId={props.containerId}
        onSelectTab={selectTab}
        activeTab={tabActive}
        fullScreen={setFullScreen}
      />
      <div
        style={
          tabActive.isPriceActive
            ? {
                padding: 8,
                height: props.height,
              }
            : {
                padding: 8,
                display: 'none',
                height: 0,
              }
        }
        id={props.containerId}
        className={cx('tradingview-pool')}
      />
      <div
        style={
          tabActive.isLiquidityActive
            ? {
                padding: 8,
                height: props.height,
              }
            : {
                padding: 0,
                visibility: 'hidden',
                height: 0,
              }
        }
        id={props.containerId + '_liquidity'}
        className={cx('tradingview-pool')}
      >
        <LiquidityChart id={props.containerId} interval={Number(interval)} heightChart={props.height} />
      </div>
      <div
        style={
          tabActive.isVolumeActive
            ? {
                padding: 8,
                height: props.height,
              }
            : {
                padding: 0,
                visibility: 'hidden',
                height: 0,
              }
        }
        id={props.containerId + '_volume'}
        className={cx('tradingview-pool')}
      >
        <VolumeChart id={props.containerId} interval={Number(interval)} volumeHeightChart={props.height} />
      </div>
    </div>
  );
};

TradingViewPool.defaultProps = {
  symbol: 'XML/USDT',
  containerId: 'tv_chart_container_liqui_pool',
  libraryPath: '../../charting_library/',
  chartsStorageApiVersion: '1.1',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: true,
  autosize: true,
};
export default TradingViewPool;
