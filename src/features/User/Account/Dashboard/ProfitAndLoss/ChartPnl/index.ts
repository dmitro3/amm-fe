export { default as ColumnPnl } from './Column';
export { default as LinePnl } from './Line';
import BigNumber from 'bignumber.js';
import moment from 'moment';

export const formatXaxis = (date: Date): string => {
  return date.getDate() === 1 ? moment(date).format('MMM') : moment(date).format('DD');
};

enum UnitLabel {
  K = 1.0e3,
  M = 1.0e6,
  B = 1.0e9,
}

export const formatYaxis = (value: number): string => {
  const valueBigNumber = new BigNumber(value).abs();
  if (valueBigNumber.div(UnitLabel.B).gte(1)) {
    return `${value < 0 ? '-' : ''}${valueBigNumber.div(UnitLabel.B)}B`;
  }
  if (valueBigNumber.div(UnitLabel.M).gte(1)) {
    return `${value < 0 ? '-' : ''}${valueBigNumber.div(UnitLabel.M)}M`;
  }
  if (valueBigNumber.div(UnitLabel.K).gte(1)) {
    return `${value < 0 ? '-' : ''}${valueBigNumber.div(UnitLabel.K)}K`;
  }
  return `${valueBigNumber}`;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const formatTooltip = ({ series, seriesIndex, dataPointIndex, w }: any): string => {
  return ` <div>
  dsadsa
            <p>${series[seriesIndex][dataPointIndex]}</p>
            <p>${w.globals.categoryLabels[dataPointIndex]}</p>
          </div>`;
};
