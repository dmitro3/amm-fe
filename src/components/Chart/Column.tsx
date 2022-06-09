import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface Props {
  [key: string]: any;
  series?: any[];
  labels?: string[];
  colors?: string[];
  widthChart?: number;
  height?: number;
}
const defaultSeries = [
  {
    name: 'Net Profit',
    data: [44, 55, -57, 56, 61, 58, 63, 60, 66],
  },
];

const defaultOptions: ApexOptions = {
  chart: {
    type: 'bar',
    height: 350,
    width: '100%',
  },
  dataLabels: {
    enabled: false,
  },
  colors: ['#5048E5'],
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  },
  yaxis: {
    title: {
      text: '$ (thousands)',
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return '$ ' + val + ' thousands';
      },
    },
  },
};

const Column: React.FC<Props> = ({
  series = defaultSeries,
  // labels,
  // colors,
  // widthChart,
  options = defaultOptions,
  height = 400,
}) => {
  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} width="100%" type="bar" height={height} />
    </div>
  );
};

export default React.memo(Column);
