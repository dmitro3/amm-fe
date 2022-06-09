export const getFirstOfDay = (date: Date): number => new Date(date).setHours(0, 0, 0);
export const getEndOfDay = (date: Date): number => new Date(date).setHours(23, 59, 59);

export const getFirstDayOfMonth = (date: Date): number =>
  getFirstOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
export const getLastDayOfMonth = (date: Date): number =>
  getEndOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

export const getFirstDayOfWeek = (date: Date): number =>
  getFirstOfDay(new Date(date.setDate(date.getDate() - date.getDay())));
export const getLastDayOfWeek = (date: Date): number =>
  getEndOfDay(new Date(date.setDate(date.getDate() - date.getDay() + 6)));

export const getFirstDayOfYear = (date: Date): number => getFirstOfDay(new Date(new Date(date).getFullYear(), 0, 1));
export const getLastDayOfYear = (date: Date): number => getEndOfDay(new Date(date.getFullYear(), 11, 31));

export const addTimeJS = (date: Date, step = 1, time: 'year' | 'month' | 'week' | 'day'): Date => {
  switch (time) {
    case 'year':
      return new Date(date.setFullYear(date.getFullYear() + step));

    case 'month':
      return new Date(new Date(date).getFullYear(), date.getMonth() + step, 1);

    case 'week':
      return new Date(date.setDate(date.getDate() + 7 * step));

    case 'day':
      return new Date(date.setDate(date.getDate() + step));

    default:
      return new Date();
  }
};

export const subTimeJS = (date: Date, step = 1, time: 'year' | 'month' | 'week' | 'day'): Date => {
  switch (time) {
    case 'year':
      return new Date(date.setFullYear(date.getFullYear() - step));

    case 'month':
      return new Date(new Date(date).getFullYear(), date.getMonth() - step, 1);

    case 'week':
      return new Date(date.setDate(date.getDate() - 7 * step));

    case 'day':
      return new Date(date.setDate(date.getDate() - step));

    default:
      return new Date();
  }
};

type KeyHideDate = 'year' | 'month' | 'date';
export const renderDate = (dateInput: Date, key?: KeyHideDate): string => {
  const date = `0${new Date(dateInput).getDate()}`.slice(-2);
  const month = `0${new Date(dateInput).getMonth() + 1}`.slice(-2);
  const year = `${new Date(dateInput).getFullYear()}`;
  switch (key) {
    case 'year':
      return `${date}-${month}`;

    default:
      return `${date}-${month}-${year}`;
  }
};

export const renderTime = (date: Date): string => {
  return `${`0${new Date(date).getHours()}`.slice(-2)}:${`0${new Date(date).getMinutes()}`.slice(-2)} ${
    new Date(date).getHours() >= 12 ? ' PM' : ' AM'
  }`;
};
