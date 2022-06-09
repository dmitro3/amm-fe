import React, { FC } from 'react';
import classnames from 'classnames/bind';
import styles from './Image.module.scss';
export interface ImageProps {
  [key: string]: any;
  width: number;
  height: number;
  shape: 'circle' | 'square';
  className?: string[];
  src: string;
}

const cx = classnames.bind(styles);
export const CImage: FC<ImageProps> = ({ shape = 'square', ...props }) => {
  return <img {...props} className={cx(`img-${shape}`, `${props.className?.join()}`)} alt={props.src} />;
};
