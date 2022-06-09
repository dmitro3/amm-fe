import { SelectItem } from 'src/interfaces/user';

export enum Volume {
  HIGHEST = 1,
  LOWEST = 2,
}
export const VolumeOptions: Array<SelectItem> = [
  {
    key: Volume.HIGHEST,
    text: 'Highest',
    value: Volume.HIGHEST,
  },
  {
    key: Volume.LOWEST,
    text: 'Lowest',
    value: Volume.LOWEST,
  },
];
