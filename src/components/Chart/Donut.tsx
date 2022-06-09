import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { COLOR_CHART } from './constant';

interface Props {
  [key: string]: any;
  series?: number[];
  labels?: string[];
  colors?: string[];
  widthChart?: number;
  loading?: boolean;
}

const Donut: React.FC<Props> = ({ series, options, colors, widthChart = 380 }) => {
  const defaultOptions: ApexOptions = {
    colors: colors || Object.values(COLOR_CHART),
    chart: {
      type: 'donut',
      sparkline: {
        enabled: true,
      },
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '50%',
        },
      },
    },
    tooltip: {
      enabled: false,
    },
    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
      active: {
        filter: {
          type: 'none',
        },
      },
    },
  };
  return (
    <ReactApexChart
      type="donut"
      options={options || defaultOptions}
      series={series}
      width={widthChart}
      height={widthChart}
    />
  );
};

export default React.memo(Donut);
