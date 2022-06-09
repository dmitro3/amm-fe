import {
  chartStyleArea,
  chartStyleBars,
  chartStyleBaseline,
  chartStyleCandles,
  chartStyleHeikinAshi,
  chartStyleHollowCandles,
  chartStyleLine,
  darkChartStyleArea,
  darkChartStyleBars,
  darkChartStyleBaseline,
  darkChartStyleCandles,
  darkChartStyleHeikinAshi,
  darkChartStyleHollowCandles,
  darkChartStyleLine,
} from 'src/assets/icon/index';
export const intervarMasterArr = [
  {
    row: [
      {
        key: 'Time',
        value: 0,
        status: false,
        poolStatus: false,
      },
      {
        key: '1m',
        value: 1,
        status: false,
        poolStatus: false,
      },
      {
        key: '3m',
        value: 3,
        status: false,
        poolStatus: false,
      },
      {
        key: '5m',
        value: 5,
        status: false,
        poolStatus: false,
      },
    ],
  },
  {
    row: [
      {
        key: '15m',
        value: 15,
        status: false,
        poolStatus: false,
      },
      {
        key: '30m',
        value: 30,
        status: false,
        poolStatus: false,
      },
      {
        key: '1h',
        value: 60,
        status: false,
        poolStatus: false,
      },
      {
        key: '2h',
        value: 120,
        status: false,
        poolStatus: false,
      },
    ],
  },
  {
    row: [
      {
        key: '4h',
        value: 240,
        status: false,
        poolStatus: false,
      },
      {
        key: '6h',
        value: 360,
        status: false,
        poolStatus: false,
      },
      {
        key: '8h',
        value: 480,
        status: false,
        poolStatus: false,
      },
      {
        key: '12h',
        value: 720,
        status: false,
        poolStatus: false,
      },
    ],
  },
  {
    row: [
      {
        key: '1D',
        value: 1440,
        status: false,
        poolStatus: false,
      },
      {
        key: '3D',
        value: 4320,
        status: false,
        poolStatus: false,
      },
      {
        key: '1W',
        value: 10080,
        status: false,
        poolStatus: false,
      },
      {
        key: '1M',
        value: 43200,
        status: false,
        poolStatus: false,
      },
    ],
  },
];

export const CHART_TYPE = [
  {
    type_number: 0,
    type_name: 'Bars',
    src_type: chartStyleBars,
  },
  {
    type_number: 1,
    type_name: 'Candles',
    src_type: chartStyleCandles,
  },
  {
    type_number: 9,
    type_name: 'Hollow Candles',
    src_type: chartStyleHollowCandles,
  },
  {
    type_number: 8,
    type_name: 'Heikin Ashi',
    src_type: chartStyleHeikinAshi,
  },
  {
    type_number: 2,
    type_name: 'Line',
    src_type: chartStyleLine,
  },
  {
    type_number: 3,
    type_name: 'Area',
    src_type: chartStyleArea,
  },
  {
    type_number: 10,
    type_name: 'Baseline',
    src_type: chartStyleBaseline,
  },
  // {
  //   type_number: 4,
  //   type_name: 'Renko',
  //   src_type: chartStyleRenko,
  // },
  // {
  //   type_number: 11,
  //   type_name: 'Line Break',
  //   src_type: chartStyleLineBreak,
  // },
  // {
  //   type_number: 5,
  //   type_name: 'Kagi',
  //   src_type: chartStyleKagi,
  // },
  // {
  //   type_number: 6,
  //   type_name: 'Point & Figure',
  //   src_type: chartStylePointFigure,
  // },
  // {
  //   type_number: 7,
  //   type_name: 'Range',
  //   src_type: chartStyleRange,
  // },
];

export const CHART_TYPE_LIGHT = [
  {
    type_number: 0,
    type_name: 'Bars',
    src_type: darkChartStyleBars,
  },
  {
    type_number: 1,
    type_name: 'Candles',
    src_type: darkChartStyleCandles,
  },
  {
    type_number: 9,
    type_name: 'Hollow Candles',
    src_type: darkChartStyleHollowCandles,
  },
  {
    type_number: 8,
    type_name: 'Heikin Ashi',
    src_type: darkChartStyleHeikinAshi,
  },
  {
    type_number: 2,
    type_name: 'Line',
    src_type: darkChartStyleLine,
  },
  {
    type_number: 3,
    type_name: 'Area',
    src_type: darkChartStyleArea,
  },
  {
    type_number: 10,
    type_name: 'Baseline',
    src_type: darkChartStyleBaseline,
  },
  // {
  //   type_number: 4,
  //   type_name: 'Renko',
  //   src_type: darkChartStyleRenko,
  // },
  // {
  //   type_number: 11,
  //   type_name: 'Line Break',
  //   src_type: darkChartStyleLineBreak,
  // },
  // {
  //   type_number: 5,
  //   type_name: 'Kagi',
  //   src_type: darkChartStyleKagi,
  // },
  // {
  //   type_number: 6,
  //   type_name: 'Point & Figure',
  //   src_type: darkChartStylePointFigure,
  // },
  // {
  //   type_number: 7,
  //   type_name: 'Range',
  //   src_type: darkChartStyleRange,
  // },
];
