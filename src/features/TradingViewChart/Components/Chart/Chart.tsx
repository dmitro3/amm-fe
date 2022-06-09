/* eslint-disable react-hooks/exhaustive-deps */
import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { ThemeName } from 'src/charting_library/charting_library.min';
import TradingViewPool from 'src/features/TradingViewChart/Components/EvrynetPoolChart/TradingViewPool';
import HightChart from 'src/features/TradingViewChart/Components/HightChart/HightChart';
import TradingView from 'src/features/TradingViewChart/Components/TradingView/TradingView';
import style from 'src/features/TradingViewChart/styles/Chart.module.scss';
interface Props {
  theme?: ThemeName;
  containerId: string;
  className?: string;
  isOrderbookChart: boolean;
  display: boolean;
}

const cx = classNames.bind(style);

const chartToolbarHeight = 60;
const minChartHeight = 530;

const Chart: React.FC<Props> = (props) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sizeChart, setChartHeight] = useState([minChartHeight, 815]);

  const fullScreen = (flag: boolean) => {
    const height = Math.max(window.innerHeight - chartToolbarHeight, minChartHeight);
    const width = window.innerWidth;
    setIsFullScreen(flag);
    if (flag) {
      setChartHeight([height, width]);
    } else {
      setChartHeight([530, 815]);
    }
  };

  const handleResize = () => {
    if (isFullScreen) {
      const height = Math.max(window.innerHeight - chartToolbarHeight, minChartHeight);
      const width = window.innerWidth;
      setChartHeight([height, width]);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize, false);
  }, []);

  return (
    <div className={isFullScreen ? cx('parent') : cx('')}>
      {props.isOrderbookChart && (
        <>
          <TradingView
            containerId={props.containerId}
            setFullScreen={fullScreen}
            height={props.display ? sizeChart[0] : 0}
          />
          <HightChart height={sizeChart[0]} width={sizeChart[1]} />
        </>
      )}
      {!props.isOrderbookChart && (
        <>
          <TradingViewPool containerId={props.containerId} setFullScreen={fullScreen} height={sizeChart[0]} />
        </>
      )}
    </div>
  );
};
export default Chart;
