import { ButtonBase } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { FC, useState } from 'react';
import { FEE_TYPE } from 'src/pages/PoolsList/constants';
import styles from './FeeButton.module.scss';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cx = classnames.bind(styles);

interface FeeButtonProps {
  onFeeTypeChange: (feeType: number) => void;
}

const FeeButton: FC<FeeButtonProps> = ({ onFeeTypeChange }) => {
  // const classes = useStyles();
  const [feeType, setFeeType] = useState(FEE_TYPE.GROSS);
  return (
    <>
      <div className={cx('type-buttons')}>
        <ButtonBase
          className={feeType == FEE_TYPE.GROSS ? cx('type-buttons--active') : ''}
          onClick={() => {
            setFeeType(FEE_TYPE.GROSS);
            onFeeTypeChange(FEE_TYPE.GROSS);
          }}
        >
          Gross fee
        </ButtonBase>
        <ButtonBase
          className={feeType == FEE_TYPE.NET ? cx('type-buttons--active') : ''}
          onClick={() => {
            setFeeType(FEE_TYPE.NET);
            onFeeTypeChange(FEE_TYPE.NET);
          }}
        >
          Net fee
        </ButtonBase>
      </div>
    </>
  );
};

export default FeeButton;
