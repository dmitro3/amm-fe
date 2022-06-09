import { Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React from 'react';

interface Props {
  number: string | number | BigNumber;
  maxDigits: number;
  fixedDecimal?: number;
  errorNumberText?: string;
}

const getDigitsOf = (number: string | number | BigNumber, fixedDecimal: number): number | undefined => {
  const n = new BigNumber(number);

  if (!n.isNaN()) {
    let count = 0;
    const s = n.toFixed(fixedDecimal);
    for (let i = 0; i < s.length; i++) {
      if (!new BigNumber(s[i]).isNaN()) {
        count++;
      }
    }
    return count;
  } else {
    return undefined;
  }
};

const formatNumber = (
  number: string | number | BigNumber,
  maxDigigits: number,
  fixedDecimal: number,
): string | undefined => {
  const n = new BigNumber(number);

  if (!n.isNaN()) {
    const s = n.toFixed(fixedDecimal);
    let countDigits = 0;
    let countString = 0;

    for (let i = 0; i < s.length; i++) {
      if (!new BigNumber(s[i]).isNaN()) {
        countDigits++;
      }

      if (countDigits >= maxDigigits) {
        countString = i + 1;
        break;
      }
    }

    return s.slice(0, countString) + '...';
  } else {
    return undefined;
  }
};

const CleanNumber: React.FC<Props> = ({ number, maxDigits, fixedDecimal = 0, errorNumberText = '-' }) => {
  const s = new BigNumber(number).toFixed(fixedDecimal);

  const getText = () => {
    if (new BigNumber(getDigitsOf(number, fixedDecimal) || '').lte(maxDigits)) {
      return <span>{s}</span>;
    }
    return (
      <>
        {!!formatNumber(number, maxDigits, fixedDecimal) ? (
          <Tooltip title={s} arrow placement={'top'}>
            <span>{formatNumber(number, maxDigits, fixedDecimal)}</span>
          </Tooltip>
        ) : (
          errorNumberText
        )}
      </>
    );
  };

  return <>{getText()}</>;
};

export default CleanNumber;
