/* eslint-disable max-len */
import React from 'react';

interface Props {
  size?: 'md' | 'lg';
  svgFill?: string;
  pathFill?: string;
}

const ArrowRightOutline: React.FC<Props> = ({ size = 'md' }) => {
  const returnSize = (size: string) => {
    switch (size) {
      case 'lg':
        return {
          height: '24',
          width: '24',
        };
      case 'md':
        return {
          height: '14',
          width: '14',
        };
      default:
        break;
    }
  };

  return (
    <>
      <svg {...returnSize(size)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.7459 19.7589C7.44784 19.4667 7.42074 19.0095 7.66461 18.6873L7.7459 18.595L14.4734 12L7.7459 5.40503C7.44784 5.11283 7.42074 4.65558 7.66461 4.33338L7.7459 4.24106C8.04396 3.94887 8.51037 3.9223 8.83904 4.16137L8.93321 4.24106L16.2541 11.418C16.5522 11.7102 16.5793 12.1675 16.3354 12.4897L16.2541 12.582L8.93321 19.7589C8.60534 20.0804 8.07376 20.0804 7.7459 19.7589Z"
          fill="white"
        />
      </svg>
    </>
  );
};

export default ArrowRightOutline;
