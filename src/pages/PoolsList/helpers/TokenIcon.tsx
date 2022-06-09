import React, { FC } from 'react';
import USDT from 'src/assets/icon/coins/USDT.svg';
import vCHF from 'src/assets/icon/coins/vCHF.svg';
import vEUR from 'src/assets/icon/coins/vEUR.svg';
import vSGD from 'src/assets/icon/coins/vSGD.svg';
import vTHB from 'src/assets/icon/coins/vTHB.svg';
import vUSD from 'src/assets/icon/coins/vUSD.svg';

export const TokenIconSet: Record<string, string> = {
  vUSD: vUSD,
  vEUR: vEUR,
  USDT: USDT,
  vSGD: vSGD,
  vCHF: vCHF,
  vTHB: vTHB,
};

type IconProp = {
  name: keyof typeof TokenIconSet;
  size: number;
};

export const TokenIcon: FC<IconProp> = ({ name, size }) => {
  const src = TokenIconSet[name];
  return src ? <img src={src} style={{ width: `${size}px`, height: `${size}px`, margin: '0 3px' }} /> : <></>;
};
