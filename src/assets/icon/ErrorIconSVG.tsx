/* eslint-disable max-len */
import React from 'react';

interface Props {
  size?: 'md' | 'lg';
  svgFill?: string;
  pathFill?: string;
}

const ErrorIconSVG: React.FC<Props> = ({ size = 'md' }) => {
  const returnSize = (size: string) => {
    switch (size) {
      case 'lg':
        return {
          height: '20',
          width: '20',
        };
      case 'md':
        return {
          height: '16',
          width: '16',
        };
      default:
        break;
    }
  };

  return (
    <>
      <svg {...returnSize(size)} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.20907 13.6245H12.7977C13.8524 13.6245 14.5144 12.4845 13.9904 11.5685L9.19973 3.19183C8.6724 2.26983 7.34307 2.26917 6.81507 3.19117L2.0164 11.5678C1.4924 12.4838 2.15374 13.6245 3.20907 13.6245Z"
          stroke="#F84960"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.0013 8.94313V6.87646"
          stroke="#F84960"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.99602 11.0001H8.00268"
          stroke="#F84960"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};

export default ErrorIconSVG;
