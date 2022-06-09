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
}

const PolarArea: React.FC<Props> = ({
  series = [42, 47, 52, 58, 65],
  labels = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
}) => {
  // const [state, setState] = useState<number[]>([]);
  const options: ApexOptions = {
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: labels,
    legend: {
      position: 'bottom',
    },
    stroke: {
      show: false,
    },
    colors: Object.values(COLOR_CHART),
    // colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
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

  // useEffect(() => {
  //   setState(series);
  // }, []);

  return <ReactApexChart options={options} series={series} type="pie" width={380} />;
};

export default React.memo(PolarArea);
