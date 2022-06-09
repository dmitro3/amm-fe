import React from 'react';

interface Props {
  size?: 'xl' | 'lg' | 'md' | 'sm';
}

const AddSVG: React.FC<Props> = ({ size = 'md' }) => {
  const returnSize = (size: string) => {
    switch (size) {
      case 'xl':
        return {
          height: '36',
          width: '36',
        };
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
      case 'sm':
        return {
          height: '12',
          width: '12',
        };
      default:
        break;
    }
  };

  return (
    <>
      <svg {...returnSize(size)} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.75 10.3391H5.25" stroke="#06C270" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.99998 14.75V5.25" stroke="#06C270" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
};

export default AddSVG;
