import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import './LineStyle.scss';
import moment from 'moment';
import { useAppSelector } from 'src/store/hooks';
import { renderDate } from 'src/helpers/date';

export const formatXaxis = (date: Date, startDate?: string, endDate?: string): string => {
  const dayInMilliseconds = 86400000;
  const currentTimestamp = date.getTime();
  let format = 'DD';

  if (startDate && endDate) {
    const startDateMS = new Date(startDate).getTime();
    const endDateMS = new Date(endDate).getTime();

    if (endDateMS - startDateMS <= dayInMilliseconds * 10) {
      if (date.getDate() === 1) {
        format = 'MMM';
      } else {
        format = 'DD';
      }
    } else {
      const daysPerLabel = Math.ceil((endDateMS - startDateMS) / dayInMilliseconds / 10);
      const days = (currentTimestamp - startDateMS) / dayInMilliseconds;
      if (days % daysPerLabel === 0) {
        if (date.getDate() <= daysPerLabel) {
          format = 'MMM';
        } else {
          format = 'DD';
        }
      } else {
        return '';
      }
    }
    return moment(currentTimestamp).format(format);
  } else {
    return date.getDate() === 1 ? moment(date).format('MMM') : moment(date).format('DD');
  }
};

interface Props {
  series?: {
    name: string;
    data: number[];
  }[];
  labels?: string[];
  colors?: string[];
  height?: string;
  width?: string;
  startDate?: string;
  endDate?: string;
  formatterYAxis?: (val: number) => string;
}

const defaultSeries = [
  {
    name: 'Cumulative PNL(%)',
    data: [28, 29, 33, 36, 32, 32, 33],
  },
  {
    name: 'Cumulative VELO trend',
    data: [12, 33, 14, 18, 17, 13, 13],
  },
];

const [defaultHeight, defaultWidth] = ['250px', '100%'];

const LinePnls: React.FC<Props> = ({
  series = defaultSeries,
  height = defaultHeight,
  width = defaultWidth,
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  startDate,
  endDate,
  formatterYAxis = (val) => val.toFixed(2),
}) => {
  const theme = useAppSelector((state) => state.theme.themeMode);

  const options: ApexOptions = {
    chart: {
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
    tooltip: {
      theme: theme,
      y: {
        formatter: (v) => Number(v).toFixed(2),
      },
      x: {
        formatter: (v) => `${renderDate(new Date(labels[v - 1]), 'year')}`,
      },
    },
    grid: {
      borderColor: 'var(--divider-line-graph)',
    },
    markers: {
      size: 0,
      colors: ['#fff'],
      strokeColors: ['var(--line-graph-color-1)', 'var(--line-graph-color-2)'],
      hover: {
        size: 3,
      },
    },
    xaxis: {
      type: 'category',
      categories: labels,
      labels: {
        show: true,
        rotate: 0,
        style: {
          colors: 'var(--label-line-graph)',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        // datetimeFormatter: {
        //   year: 'yyyy',
        //   month: "MMM 'yy",
        //   day: 'dd',
        //   hour: 'HH:mm',
        // },
        formatter: (v) => formatXaxis(new Date(v), startDate, endDate),
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
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
        formatter: formatterYAxis,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: 'var(--label-line-graph)',
        // formatter: (v: number) => `${Number(v).toFixed(0)}`,
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="line" width={width} height={height} />;
};

export default React.memo(LinePnls);
