import React, { useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import classnames from 'classnames/bind';
import { DAY_IN_MILLISECONDS } from 'src/helpers/pool';
import styles from './Charts.module.scss';
import { Interval } from '../../constants/interval';

interface Props {
  onIntervalSelected: (duration: number) => void;
}

const intervals = [
  {
    label: '1D',
    value: Interval.ONE_DAY,
    duration: DAY_IN_MILLISECONDS,
  },
  {
    label: '1W',
    value: Interval.ONE_WEEK,
    duration: 7 * DAY_IN_MILLISECONDS,
  },
  {
    label: '1M',
    value: Interval.ONE_MONTH,
    duration: 30 * DAY_IN_MILLISECONDS,
  },
];

const cx = classnames.bind(styles);
const TimeInterval: React.FC<Props> = ({ onIntervalSelected }) => {
  const [selectedInterval, setSelectedInterval] = useState<number>(Interval.ONE_DAY);

  const handleSelect = (value: number, duration: number) => {
    setSelectedInterval(value);
    onIntervalSelected(duration);
  };
  return (
    <div className={cx('time-interval')}>
      <p>Time</p>
      {intervals.map((item, key) => {
        return (
          <ButtonBase
            className={cx('btn', selectedInterval == item.value ? 'btn--active' : '')}
            onClick={() => handleSelect(item.value, item.duration)}
            key={key}
          >
            {item.label}
          </ButtonBase>
        );
      })}
    </div>
  );
};

export default TimeInterval;
