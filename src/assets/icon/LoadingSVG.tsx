/* eslint-disable max-len */
import React, { FC } from 'react';
import 'src/styles/_base.scss';

interface Props {
  size: 'lg' | 'md' | 'sm' | 'xs';
  activeColor?: string;
}

const LoadingSVG: FC<Props> = (props) => {
  const returnSize = (size: string) => {
    switch (size) {
      case 'lg':
        return {
          height: '20',
          width: '20',
          viewBox: '0 0 20 20',
        };
      case 'md':
        return {
          height: '16',
          width: '16',
          viewBox: '0 0 20 20',
        };
      case 'sm':
        return {
          height: '14',
          width: '14',
          viewBox: '0 0 20 20',
        };

      case 'xs':
        return {
          height: '14',
          width: '14',
          viewBox: '0 0 20 20',
        };

      default:
        break;
    }
  };
  return (
    <svg {...returnSize(props.size)} fill={'none'} xmlns="http://www.w3.org/2000/svg" className="loading-rotate">
      <path
        d="M10.0002 1.66665C8.35198 1.66664 6.74082 2.15539 5.37041 3.07106C4 3.98674 2.9319 5.28823 2.30117 6.81095C1.67044 8.33367 1.50541 10.0092 1.82695 11.6257C2.14849 13.2422 2.94217 14.7271 4.1076 15.8925C5.27304 17.058 6.7579 17.8516 8.37441 18.1732C9.99092 18.4947 11.6665 18.3297 13.1892 17.699C14.7119 17.0682 16.0134 16.0001 16.9291 14.6297C17.8448 13.2593 18.3335 11.6482 18.3335 9.99998"
        stroke={props.activeColor || '#FCFCFC'}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LoadingSVG;
