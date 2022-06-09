import BigNumber from 'bignumber.js';
import classNames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import {
  HistoryCallback,
  IBasicDataFeed,
  IChartingLibraryWidget,
  LibrarySymbolInfo,
  ResolutionString,
  ResolveCallback,
  SubscribeBarsCallback,
  ThemeName,
  TradingTerminalWidgetOptions,
  widget,
} from 'src/charting_library/charting_library.min';
import { barsUrl, SYMBOL_TYPE } from 'src/components/Chart/constant';
import { TradingMethod } from 'src/constants/dashboard';
import eventBus from 'src/event/event-bus';
import { Trade } from 'src/features/MarketTrade/interfaces/Trade';
import { Pair } from 'src/features/Pairs/interfaces/pair';
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
import { Candle } from 'src/features/TradingViewChart/interfaces';
import style from 'src/features/TradingViewChart/styles/Chart.module.scss';
import { makeApiRequest } from 'src/helpers/ChartHelper';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppSelector } from 'src/store/hooks';
interface Props {
  containerId: string;
  libraryPath?: string;
  chartsStorageUrl?: string;
  chartsStorageApiVersion?: '1.0' | '1.1';
  clientId?: string;
  userId?: string;
  fullscreen?: boolean;
  autosize?: boolean;
  className?: string;
  setFullScreen: (flag: boolean) => void;
  height?: number;
}

const cx = classNames.bind(style);
const configurationData = {
  supports_search: true,
  supports_marks: true,
  supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'],
};

const TradingView: React.FC<Props> = (props) => {
  const [tradingViewChart, setTradingViewChart] = useState<IChartingLibraryWidget>();
  const [isChartReady, setChartReady] = useState(false);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const isShowTradingChart = useAppSelector((state) => state.chart.isShowTradingView);
  const selectedPair: Pair | undefined = useAppSelector((state) => state.pair.selectedPair);
  const pairRef = useRef<Pair>();
  const tradingMethodsRef = useRef<TradingMethod[]>();
  const intervalInMillisecondsRef = useRef<number>(getInterval(DEFAULT_TRADING_VIEW_INTERVAL) * 60 * 1000);
  const lastCandleRef = useRef<Candle>({} as Candle);
  const theme = useAppSelector((state) => state.theme.themeMode);
  const tradingViewTheme = (theme.charAt(0).toUpperCase() + theme.slice(1)) as ThemeName;
  tradingMethodsRef.current = selectedMethods
    .map((method) => method.key)
    .filter((method) => method !== TradingMethod.BSCPool);
  pairRef.current = selectedPair;

  const setFullScreen = (flag: boolean) => {
    props.setFullScreen(flag);
  };
  let chartRealtimeCallback: (candle: Candle) => void;
  const chartResetCacheNeededCallback = useRef<() => void>();
  const [interval, setInterval] = useState(getInterval(DEFAULT_TRADING_VIEW_INTERVAL));
  const [leftToolbarEnabled, setLeftToolbarEnabled] = useState(true);
  const listDisable = [
    'header_widget',
    'display_market_status',
    'timeframes_toolbar',
    'edit_buttons_in_legend',
    'volume_force_overlay',
    'legend_context_menu',
  ];

  intervalInMillisecondsRef.current = interval * 60 * 1000;
  const onReady = (callback: any) => {
    setTimeout(() => callback(configurationData));
  };
  const getBars = async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    from: number,
    to: number,
    onResult: HistoryCallback,
    // onErrorCallback: ErrorCallback,
    // isFirstCall: boolean,
  ) => {
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
        network: tradingMethodsRef.current?.filter((i) => i !== TradingMethod.PancakeswapPool),
        timezone: clientTimezone,
      };
      const methodBefore = tradingMethodsRef.current;
      const data = await makeApiRequest(barsUrl, urlParameters);
      const flag = JSON.stringify(methodBefore) === JSON.stringify(tradingMethodsRef.current);
      if (flag) {
        if (data.length === 0) {
          onResult([], {
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
          volume: parseFloat(bar.volume),
        }));
        lastCandleRef.current = bars[bars.length - 1];
        onResult(bars, { noData: false });
      }
    } catch (error) {
      // onErrorCallback(error);
      onResult([], { noData: true });
    }
  };

  const resolveSymbol = async (
    symbolName: string,
    onSymbolResolvedCallback: ResolveCallback,
    // onResolveErrorCallback: ErrorCallback,
  ) => {
    const selectedPair = pairRef.current;
    const symbol = `${selectedPair?.base_symbol}/${selectedPair?.quote_symbol}`;
    const priceScale = selectedPair ? new BigNumber(1).div(selectedPair.price_precision).toNumber() : 100000;
    // log(amount_precision) * (fee precision)
    const volumePrecision = -Math.log10(Number(selectedPair?.amount_precision || 0.01)) + 2;
    const symbolInfo: LibrarySymbolInfo = {
      exchange: '',
      full_name: '',
      listed_exchange: '',
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

  const subscribeBars = (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void,
  ) => {
    chartRealtimeCallback = onRealtimeCallback;
    chartResetCacheNeededCallback.current = onResetCacheNeededCallback;
    eventBus.remove(SocketEvent.OrderbookTradeCreated);
    eventBus.on(SocketEvent.OrderbookTradeCreated, (trades: Trade[]) => {
      const intervalInMilliseconds = intervalInMillisecondsRef.current;
      trades.forEach((trade: any) => {
        const isOrderbookTrade = (trade.method & TradingMethod.CombinedOrderbook) > 0;
        if (isOrderbookTrade && tradingMethodsRef.current?.includes(trade.method)) {
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
    const disabledFeatures = [...listDisable];
    if (!leftToolbarEnabled) {
      disabledFeatures.push('left_toolbar');
    }

    const widgetOptions: TradingTerminalWidgetOptions = {
      symbol: getSymbol(selectedPair),
      datafeed: datafeed,
      interval: `${interval}`,
      container_id: props.containerId,
      library_path: props.libraryPath,
      locale: 'en',
      timezone: getClientTimezone(),
      disabled_features: disabledFeatures,
      enabled_features: ['study_templates'],
      overrides: {
        volumePaneSize: 'medium',
      },
      charts_storage_url: props.chartsStorageUrl,
      charts_storage_api_version: props.chartsStorageApiVersion,
      client_id: props.clientId,
      user_id: props.userId,
      autosize: true,
      studies_overrides: {
        'volume.show ma': true,
      },
      fullscreen: false,
      theme: tradingViewTheme,
    };
    const chart = new widget(widgetOptions);
    setTradingViewChart(chart);
    chart.onChartReady(() => {
      setChartReady(true);
      chart.chart().setResolution(getIntervalString(interval), () => {});
      chart.applyOverrides({ 'paneProperties.topMargin': 15 });
    });
  }, [leftToolbarEnabled]);

  useEffect(() => {
    if (isChartReady) {
      const onResetCacheNeededCallback = chartResetCacheNeededCallback.current;
      if (onResetCacheNeededCallback) onResetCacheNeededCallback();
      tradingViewChart?.chart().resetData();
    }
  }, [selectedMethods]);

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
  useEffect(() => {
    if (isChartReady) {
      tradingViewChart?.chart().setResolution(getIntervalString(interval), () => {});
    }
  }, [isChartReady, interval]);

  const setChartType = (chartTypeNumber: number) => {
    tradingViewChart?.chart().setChartType(chartTypeNumber);
  };

  const selectInterval = (value: number) => {
    setInterval(value);
  };

  const openIndicatorPopup = () => {
    tradingViewChart?.chart().executeActionById('insertIndicator');
  };

  const disableLeftToolBar = () => {
    setLeftToolbarEnabled(false);
  };

  const enableLefToolbar = () => {
    setLeftToolbarEnabled(true);
  };
  return (
    <div className={cx('tradingview-parent')}>
      <NabarTradingView
        onSelectInterval={selectInterval}
        openIndicatorPopup={openIndicatorPopup}
        setChartType={setChartType}
        disableLeftToolBar={disableLeftToolBar}
        enableLefToolbar={enableLefToolbar}
        containerId={props.containerId}
        fullScreen={setFullScreen}
      />
      <div
        style={{
          padding: 8,
          height: props.height,
        }}
        id={props.containerId}
        className={isShowTradingChart ? cx('tradingview-chart') : cx('hide-tradingview')}
      ></div>
    </div>
  );
};

TradingView.defaultProps = {
  containerId: 'tv_chart_container',
  libraryPath: '../../charting_library/',
  chartsStorageApiVersion: '1.1',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: true,
  height: 530,
};
export default TradingView;
