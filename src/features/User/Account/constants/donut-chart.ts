import { ApexOptions } from 'apexcharts';
export const CHART_NO_DATA = {
  Label: ['no_data'],
  Value: [1],
};
export const optionChartDonutDashboardOverview: ApexOptions = {
  chart: {
    type: 'donut',
  },
  colors: [
    '#FD2254',
    '#00B7FE',
    '#F178B6',
    '#7879F1',
    '#F2994A',
    '#0000ff',
    '#2a6fdb',
    '#48d6d2',
    '#81e9e6',
    '#fefcbf',
  ],
  stroke: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    labels: {
      colors: 'var(--title-active)',
    },
    itemMargin: {
      vertical: 2,
    },
  },
  tooltip: {
    enabled: true,
  },
  plotOptions: {
    pie: {
      expandOnClick: true,
      donut: {
        size: '80%',
      },
    },
  },
  labels: [],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
};
