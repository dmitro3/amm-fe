/* eslint-disable max-len */
import React from 'react';

interface Props {
  size?: 'sm' | 'md';
}

const PancakeswapPoolIcon: React.FC<Props> = ({ size = 'md' }) => {
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
      <svg
        {...returnSize(size)}
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xlinkHref="http://www.w3.org/1999/xlink"
      >
        <rect width="18" height="18" fill="url(#pattern0)" />
        <defs>
          <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
            <use xlinkHref="#image0_12922_42835" transform="scale(0.005)" />
          </pattern>
          <image
            id="image0_12922_42835"
            width="200"
            height="200"
            xlinkHref="data:image/png;base64,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"
          />
        </defs>
      </svg>
    </>
  );
};

export default PancakeswapPoolIcon;
