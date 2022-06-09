import classNames from 'classnames/bind';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React, { useEffect, useState } from 'react';
import { orderbookSelector } from 'src/features/Orderbook/helpers/orderbookHelper';
import style from 'src/features/TradingViewChart/styles/HightCharts.module.scss';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppSelector } from 'src/store/hooks';

interface Props {
  width?: number;
  id?: string;
  background?: string;
  height?: number;
}

const cx = classNames.bind(style);
const HightChart: React.FC<Props> = (props) => {
  const theme = useAppSelector((state) => state.theme.themeMode);
  const isShowTradingChart = useAppSelector((state) => state.chart.isShowTradingView);
  const orderbook: any = useAppSelector(orderbookSelector);
  const [arrayBids, setArrayBids] = useState<number[][]>([[]]);
  const [arrayAsk, setArrayAsk] = useState<number[][]>([[]]);
  useEffect(() => {
    Array.from(
      document.getElementsByClassName('highcharts-credits') as HTMLCollectionOf<HTMLElement>,
    )[0].style.visibility = 'hidden';
  }, []);

  const calcBidAsk = (
    res: { price: number; amount: number }[],
    order: { price: string; amount: string; method: number },
  ) => {
    const obj = { price: Number(order.price), amount: Number(order.amount) };
    const filter = res.filter((e) => e.price === obj.price);
    if (filter.length !== 0) {
      res.forEach((e) => {
        if (e.price === obj.price) {
          e.amount += obj.amount;
        }
      });
    } else {
      res.push(obj);
    }
    return res;
  };

  useEffect(() => {
    if (orderbook.bids !== undefined) {
      arrayBids.length = 0;
      arrayAsk.length = 0;
      let bidAmount = 0;
      let askAmount = 0;
      const bids = orderbook.bids
        .slice(0, 15)
        .reduce(
          (res: { price: number; amount: number }[], element: { price: string; amount: string; method: number }) => {
            return calcBidAsk(res, element);
          },
          [],
        );
      const finalBid = bids.map((element: { price: number; amount: number }) => {
        bidAmount += Number(element.amount);
        const arrBid = [Number(element.price), bidAmount];
        return arrBid;
      });
      setArrayBids(finalBid.reverse());
      const ask = orderbook.asks
        .slice(0, 15)
        .reduce(
          (res: { price: number; amount: number }[], element: { price: string; amount: string; method: number }) => {
            return calcBidAsk(res, element);
          },
          [],
        );
      const finalAsk = ask.map((element: any) => {
        askAmount += Number(element.amount);
        const arrAsk = [Number(element.price), askAmount];
        return arrAsk;
      });
      setArrayAsk(finalAsk);
    }
  }, [orderbook]);

  const options = {
    chart: {
      type: 'area',
      zoomType: 'xy',
      backgroundColor: theme === THEME_MODE.LIGHT ? '#F5F5F5' : '#232424',
      height: props.height,
      width: props.width,
    },
    title: {
      text: '',
    },
    xAxis: {
      minPadding: 0,
      maxPadding: 0,
      title: {
        text: '',
      },
    },
    yAxis: [
      {
        lineWidth: 1,
        gridLineWidth: 0,
        title: null,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: 'outside',
        labels: {
          align: 'right',
        },
        crosshair: {
          dashStyle: 'Dash',
          label: {
            enabled: true,
          },
        },
        visible: false,
      },
      {
        opposite: true,
        linkedTo: 0,
        lineWidth: 1,
        gridLineWidth: 0,
        title: null,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: 'outside',
        labels: {
          align: 'left',
        },
        crosshair: {
          dashStyle: 'Dash',
          label: {
            enabled: true,
          },
        },
      },
    ],
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.5,
        lineWidth: 1,
        step: 'center',
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size=10px;">Price: {point.key}</span><br/>',
      valueDecimals: 2,
      positioner: (w: number, h: any, p: { plotX: any; plotY: number }) => {
        return {
          x: p.plotX - w + 30 > 0 ? p.plotX - w : p.plotX + 70,
          y: p.plotY,
        };
      },
    },
    series: [
      {
        name: 'Bids',
        data: arrayBids,
        color: '#03a7a8',
      },
      {
        name: 'Asks',
        data: arrayAsk,
        color: '#fc5857',
      },
    ],
  };
  return (
    <div
      className={isShowTradingChart ? cx('hight-chart-container-visible') : cx('hight-chart-container')}
      id={props.id}
    >
      <HighchartsReact highcharts={Highcharts} options={options} allowChartUpdate={true} />
    </div>
  );
};
export default HightChart;
