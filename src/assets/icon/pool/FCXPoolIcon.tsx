/* eslint-disable max-len */
import React from 'react';

interface Props {
  size?: 'sm' | 'md';
}

const FCXPoolIcon: React.FC<Props> = ({ size = 'md' }) => {
  const returnSize = (size: string): { height: string; width: string } => {
    switch (size) {
      case 'sm':
        return {
          height: '12',
          width: '12',
        };
      case 'md':
        return {
          height: '18',
          width: '18',
        };
      default:
        return {
          height: '18',
          width: '18',
        };
    }
  };

  return (
    <>
      <svg {...returnSize(size)} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="url(#paint0_linear_12922_42842)" />
        <path
          d="M11.682 6.01047H8.29676C8.12282 6.01047 7.98067 6.14629 7.98067 6.31248V7.98515C7.98067 8.15135 8.12282 8.28716 8.29676 8.28716H11.568C11.7419 8.28716 11.884 8.42298 11.884 8.58917V9.79543C11.884 9.96162 11.7419 10.0974 11.568 10.0974H8.29676C8.12282 10.0974 7.98067 10.2333 7.98067 10.3995V13.4982C7.98067 13.6644 7.83853 13.8002 7.66459 13.8002H6.31608C6.14214 13.7984 6 13.6644 6 13.4982V4.50221C6 4.33601 6.14214 4.2002 6.31608 4.2002H11.6839C11.8579 4.2002 12 4.33601 12 4.50221V5.70846C11.9981 5.87644 11.8579 6.01047 11.682 6.01047Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_12922_42842"
            x1="-0.765957"
            y1="-0.99"
            x2="33.0272"
            y2="8.6959"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1A88C9" />
            <stop offset="1" stopColor="#9149FF" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

export default FCXPoolIcon;
