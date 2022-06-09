import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import './Spline.scss';

interface Props {
  [key: string]: any;
  series?: any[];
  labels?: string[];
  colors?: string[];
  widthChart?: number;
  options?: ApexOptions;
  height?: number;
}
const defaultSeries = [
  {
    name: 'series1',
    data: [31, 0, 40, 28, 51, 42, 100, 31, 0, 40, 28, 51, 42, 109, 100, 31, 0, 40, 28, 51, 42, 109, 100],
  },
];
const defaultOptions: ApexOptions = {
  chart: {
    width: '100%',
    height: 300,
    type: 'area',
    toolbar: { show: false },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  xaxis: {
    tickAmount: 20,
    labels: {
      formatter: function (value) {
        return value;
      },
    },
  },
  yaxis: {
    opposite: true,
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm',
    },
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

const Spline: React.FC<Props> = ({
  series = defaultSeries,
  // labels,
  // colors,
  // widthChart,
  options = defaultOptions,
  height = 400,
}) => {
  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="area" width="100%" height={height} />
    </div>
  );
};

export default React.memo(Spline);
