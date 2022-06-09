import React, { FC } from 'react';
import './style.scss';

interface Props {
  type: 'text' | 'spin';
  size: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
}

const CLoading: FC<Props> = ({ type = 'text', size = 'md' }) => {
  return (
    <div className="c-loading">
      {type === 'text' ? (
        <span className={`text-loading text-loading-${size}`}>Loading...</span>
      ) : (
        <div className={`lds-ring lds-ring-${size} `}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
    </div>
  );
};

export default CLoading;
