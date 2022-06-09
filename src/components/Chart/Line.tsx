import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface Props {
  series?: {
    name: string;
    data: number[][];
  }[];
  labels?: string[];
  colors?: string[];
  height?: string;
  width?: string;
}

const defaultSeries = [
  {
    name: 'Cumulative PNL(%)',
    data: [
      [1486684800000, 0],
      [1486771200000, 0],
      // [1486857600000, 0],
      [1486944000000, 0],
      [1487030400000, 0],
      [1487116800000, 0],
    ],
  },
  // {
  //   name: 'Cumulative VELO trend',
  //   data: [
  //     [1486684800000, 38],
  //     [1486771200000, 45],
  //     [1486857600000, 21],
  //     [1486944000000, 23],
  //     [1487030400000, 27],
  //     [1487116800000, 18],
  //   ],
  // },
];

const [defaultHeight, defaultWidth] = ['350px', '100%'];

const Line: React.FC<Props> = ({ series = defaultSeries, height = defaultHeight, width = defaultWidth }) => {
  const options: ApexOptions = {
    chart: {
      height: height,
      width: width,
      type: 'line',
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    grid: {
      borderColor: 'var(--divider-line-graph)',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    markers: {
      size: 4,
      colors: ['#fff'],
      strokeColors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
    },
    tooltip: {},
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        style: {
          colors: 'var(--label-line-graph)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd',
          hour: 'HH:mm',
        },
      },
      axisBorder: {
        show: false,
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
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="line" width={width} height={height} />;
};

export default React.memo(Line);
