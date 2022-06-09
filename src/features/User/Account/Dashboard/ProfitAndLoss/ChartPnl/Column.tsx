/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatXaxis } from 'src/features/User/Account/Dashboard/ProfitAndLoss/ChartPnl/Line';
import { renderDate } from 'src/helpers/date';
import { useAppSelector } from 'src/store/hooks';

interface Props {
  [key: string]: any;
  series?: any[];
  labels?: string[];
  colors?: string[];
  widthChart?: number;
  startDate?: string;
  endDate?: string;
  formatterYAxis?: (val: number) => string;
}
const defaultSeries = [
  {
    name: 'Net Profit',
    data: [44, 55, -57, 56, 61, 58, 63, 60, 66],
  },
];

const ColumnPnl: React.FC<Props> = ({
  series = defaultSeries,
  labels,
  // colors,
  // widthChart,
  options,
  startDate,
  endDate,
  formatterYAxis = (val) => `${val.toFixed(0)}`,
}) => {
  const theme = useAppSelector((state) => state.theme.themeMode);

  const defaultOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 500,
      width: '100%',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: 'var(--divider-line-graph)',
    },
    colors: [({ value }: any) => (value > 0 ? '#06c270' : '#f84960')],
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      type: 'category',
      categories: labels,
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: 0,
        show: true,
        style: {
          colors: 'var(--label-line-graph)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd/MM',
          hour: 'HH:mm',
        },
        formatter: (v) => formatXaxis(new Date(v), startDate, endDate),
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: 'var(--label-line-graph)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        formatter: formatterYAxis,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (v) => Number(v).toFixed(2),
      },
      x: {
        formatter: (v) => `${renderDate(new Date(v), 'year')}`,
      },
      theme: theme,
    },
  };
  return (
    <ReactApexChart
      options={{
        ...defaultOptions,
        ...options,
      }}
      series={series}
      width="100%"
      height={250}
      type="bar"
    />
  );
};

export default React.memo(ColumnPnl);
