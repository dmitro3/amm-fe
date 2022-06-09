import BigNumber from 'bignumber.js';

const minutesInMonth = new BigNumber(1).times(30).times(24).times(60).toString();
const minutesInDay = new BigNumber(1).times(24).times(60).toString();
const minutesInHour = new BigNumber(1).times(60).toString();

export const getTimeFromInterval = (interval: string | number | BigNumber): string => {
  let rest: BigNumber = new BigNumber(interval);
  const data = {
    months: new BigNumber(0),
    days: new BigNumber(0),
    hours: new BigNumber(0),
    minutes: new BigNumber(0),
  };

  // get months
  const months = rest.div(minutesInMonth);
  rest = rest.minus(months.dp(0).times(minutesInMonth));
  data.months = months.dp(0);

  // get days
  const days = rest.div(minutesInDay);
  rest = rest.minus(days.dp(0).times(minutesInDay));
  data.days = days.dp(0);

  // get hours
  const hours = rest.div(minutesInHour);
  rest = rest.minus(hours.dp(0).times(minutesInHour));
  data.hours = hours.dp(0);

  // get minutes
  data.minutes = rest;

  let result = '';

  if (data.months.gt(0)) {
    result += data.months.toString() + ' months ';
  }
  if (data.days.gt(0)) {
    result += data.days.toString() + ' days ';
  }
  if (data.hours.gt(0)) {
    result += data.hours.toString() + ' hours ';
  }
  if (data.minutes.gt(0)) {
    result += data.minutes.toString() + ' minutes ';
  }

  return result;
};
