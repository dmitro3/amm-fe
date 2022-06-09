import React from 'react';

interface Props {
  size?: 'xl' | 'lg' | 'md' | 'sm';
}
const CheckSVS: React.FC<Props> = ({ size = 'md' }) => {
  const returnSize = (size: string) => {
    switch (size) {
      case 'xl':
        return {
          height: '36',
          width: '37',
        };
      case 'lg':
        return {
          height: '20',
          width: '21',
        };
      case 'md':
        return {
          height: '16',
          width: '17',
        };
      case 'sm':
        return {
          height: '12',
          width: '13',
        };

      default:
        break;
    }
  };

  return (
    <>
      <svg {...returnSize(size)} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.00001 13.4749L4.52501 9.99987L3.34167 11.1749L8.00001 15.8332L18 5.8332L16.825 4.6582L8.00001 13.4749Z"
          fill="#06C270"
        />
      </svg>
    </>
  );
};

export default CheckSVS;
