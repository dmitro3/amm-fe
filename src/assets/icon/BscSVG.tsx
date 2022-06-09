/* eslint-disable max-len */
import React from 'react';

interface Props {
  size?: 'xl' | 'lg' | 'md' | 'sm';
}

const BscSVG: React.FC<Props> = ({ size = 'md' }: Props) => {
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
      <svg {...returnSize(size)} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.5641 15.7654L18.0023 10.3294L23.4426 15.7698L26.6051 12.6051L18.0023 4L9.39941 12.6029L12.5641 15.7654Z"
          fill="#F3BA2F"
        />
        <path d="M3.99976 18.0002L7.1633 14.8367L10.3269 18.0002L7.1633 21.1638L3.99976 18.0002Z" fill="#F3BA2F" />
        <path
          d="M12.5641 20.2346L18.0023 25.6728L23.4427 20.2324L26.6074 23.3927L26.6052 23.3949L18.0023 32L9.39944 23.3993L9.39502 23.3949L12.5641 20.2346Z"
          fill="#F3BA2F"
        />
        <path d="M25.6719 18.0015L28.8354 14.8379L31.999 18.0015L28.8354 21.165L25.6719 18.0015Z" fill="#F3BA2F" />
        <path
          d="M21.2109 17.9992L18.0019 14.7881L15.629 17.1611L15.3547 17.4331L14.793 17.9948L14.7886 17.9992L14.793 18.0059L18.0019 21.2126L21.2109 18.0014L21.2131 17.9992H21.2109Z"
          fill="#F3BA2F"
        />
      </svg>
    </>
  );
};

export default BscSVG;
