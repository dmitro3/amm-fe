import { COLOR_CHART } from 'src/components/Chart/constant';
import { Token } from 'src/interfaces/pool';

export const chartData = (tokens: Token[]): Array<number> => {
  return Object.keys(COLOR_CHART).map((item) => {
    const token = tokens.find((x) => x.symbol === item);
    return token ? parseInt(token.denormWeight) : 0;
  });
};
