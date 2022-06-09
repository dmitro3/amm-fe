import { ButtonBase, InputBase, Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { ChangeEvent, useEffect } from 'react';
import OutlinedQuestionMark from 'src/assets/icon/OutlinedQuestionMark';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import {
  isCombineOB,
  isContainBscLB,
  isContainPancakeswapLB,
  isSingleBscOB,
  isSingleStellarOB,
} from 'src/features/OrderForm/helpers/network/checkNetwork';
import {
  setCustomSlippageTolerance,
  setFocusCustomSlippageTolerance,
  setSlippageTolerance,
} from 'src/features/SlippageTolerance/redux/slippageTolerance';
import {
  disableInvalidCharacters,
  disableNumberInputScroll,
  disableNumberInputUpDown,
} from 'src/features/SwapForm/helpers/disableInvalidNumberInput';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from '../styles/SlippageTolerance.module.scss';

const cx = classnames.bind(styles);

interface Props {
  maxSlippage?: '90' | '100';
  behaviour?: Behaviour;
  warning?: string;
}

const SLIPPAGE_TOLERANCE_DECIMAL = 2;

const SlippageTolerance: React.FC<Props> = ({ maxSlippage = '90', behaviour, warning }) => {
  const slippageTolerance = useAppSelector((state) => state.slippage.slippageTolerance);
  const customSlippageTolerance = useAppSelector((state) => state.slippage.customSlippageTolerance);
  const focusCustomSlippageTolerance = useAppSelector((state) => state.slippage.focusCustomSlippageTolerance);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const dispatch = useAppDispatch();

  const customSlippageToleranceRegex = new RegExp(`^\\d{0,3}.\\d{0,${SLIPPAGE_TOLERANCE_DECIMAL}}$`);

  const handleCustomSlippageToleranceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      if (customSlippageToleranceRegex.test(value)) {
        if (new BigNumber(value).gt(maxSlippage)) {
          dispatch(setCustomSlippageTolerance(maxSlippage));
          dispatch(setSlippageTolerance(''));
        } else if (new BigNumber(value).lte(0)) {
          dispatch(setCustomSlippageTolerance('0'));
          dispatch(setSlippageTolerance(''));
        } else {
          dispatch(setCustomSlippageTolerance(value));
          dispatch(setSlippageTolerance(''));
        }
      }
    } else {
      dispatch(setCustomSlippageTolerance(''));
      dispatch(setSlippageTolerance(maxSlippage));
    }
  };

  const formatNumberOnBlur = (number: string) => {
    if (!new BigNumber(number).dp(SLIPPAGE_TOLERANCE_DECIMAL).isNaN()) {
      dispatch(setCustomSlippageTolerance(new BigNumber(number).dp(SLIPPAGE_TOLERANCE_DECIMAL).toString()));
      dispatch(setSlippageTolerance(''));
    } else {
      dispatch(setCustomSlippageTolerance(''));
      dispatch(setSlippageTolerance(maxSlippage));
    }
  };

  useEffect(() => {
    dispatch(setSlippageTolerance(maxSlippage));
  }, []);

  useEffect(() => {
    if (new BigNumber(slippageTolerance).isNaN() && new BigNumber(customSlippageTolerance).isNaN()) {
      dispatch(setSlippageTolerance(maxSlippage));
      dispatch(setFocusCustomSlippageTolerance(false));
    }
  }, [slippageTolerance, customSlippageTolerance]);

  useEffect(() => {
    dispatch(setSlippageTolerance(maxSlippage));
    dispatch(setCustomSlippageTolerance(''));
  }, [selectedPair, behaviour]);

  return (
    <>
      <div className={cx('slippage-tolerance')}>
        <div className={cx('tooltip-container')}>
          <p>Slippage tolerance</p>
          <Tooltip
            title={
              <>
                {/* Single order book tooltip */}
                {(isSingleBscOB(selectedMethods) || isSingleStellarOB(selectedMethods)) && (
                  <>
                    In single order book trading, slippage is calculated against the bid/ask price. Your transaction
                    will revert if the matching price changes unfavorably (compared to the bid/ask price) by more than
                    the slippage tolerance percentage
                  </>
                )}
                {/* Combine order book tooltip */}
                {isCombineOB(selectedMethods) && (
                  <>Your transaction will revert if the SOR price changes unfavorably by more than this percentage.</>
                )}
                {/* Liquidity pool tooltip */}
                {(isContainBscLB(selectedMethods) || isContainPancakeswapLB(selectedMethods)) && (
                  <>
                    Your transaction will revert if the price changes unfavorably by more than this percentage Maximum
                    slippage tolerance is 90%
                  </>
                )}
              </>
            }
            arrow
            PopperProps={{
              className: 'tooltip-arrow-lg',
            }}
          >
            <div className={cx('icon-container')}>
              <OutlinedQuestionMark />
            </div>
          </Tooltip>
        </div>
        <div className={cx('button-group')}>
          <ButtonBase
            className={cx(slippageTolerance === '0.5' && !focusCustomSlippageTolerance ? 'active-button' : 'button')}
            disableRipple={true}
            onClick={() => {
              dispatch(setSlippageTolerance('0.5'));
              dispatch(setCustomSlippageTolerance(''));
            }}
          >
            0.5%
          </ButtonBase>
          <ButtonBase
            className={cx(slippageTolerance === '1' && !focusCustomSlippageTolerance ? 'active-button' : 'button')}
            disableRipple={true}
            onClick={() => {
              dispatch(setSlippageTolerance('1'));
              dispatch(setCustomSlippageTolerance(''));
            }}
          >
            1%
          </ButtonBase>
          <ButtonBase
            className={cx(slippageTolerance === '2' && !focusCustomSlippageTolerance ? 'active-button' : 'button')}
            disableRipple={true}
            onClick={() => {
              dispatch(setSlippageTolerance('2'));
              dispatch(setCustomSlippageTolerance(''));
            }}
          >
            2%
          </ButtonBase>
          <ButtonBase
            className={cx(slippageTolerance === '5' && !focusCustomSlippageTolerance ? 'active-button' : 'button')}
            disableRipple={true}
            onClick={() => {
              dispatch(setSlippageTolerance('5'));
              dispatch(setCustomSlippageTolerance(''));
            }}
          >
            5%
          </ButtonBase>
          <ButtonBase
            className={cx(
              slippageTolerance === maxSlippage && !focusCustomSlippageTolerance ? 'active-button' : 'button',
            )}
            disableRipple={true}
            onClick={() => {
              dispatch(setSlippageTolerance(maxSlippage));
              dispatch(setCustomSlippageTolerance(''));
            }}
          >
            {maxSlippage}%
          </ButtonBase>
          <form id="novalidatedform" noValidate />
          <InputBase
            className={cx(
              'custom-slippage-tolerance',
              (focusCustomSlippageTolerance || customSlippageTolerance) && 'focus-custom-slippage-tolerance',
            )}
            placeholder={'Enter'}
            value={customSlippageTolerance || ''}
            onWheel={disableNumberInputScroll}
            onKeyPress={disableInvalidCharacters}
            onKeyUp={disableNumberInputUpDown}
            onKeyDown={disableNumberInputUpDown}
            onChange={handleCustomSlippageToleranceChange}
            onBlur={(e) => {
              dispatch(setFocusCustomSlippageTolerance(false));
              formatNumberOnBlur(e.target.value);
            }}
            onClick={() => {
              dispatch(setFocusCustomSlippageTolerance(true));
            }}
            type={'number'}
            inputProps={{ form: 'novalidatedform' }}
            startAdornment={!!customSlippageTolerance && <span className={cx('hidden-percentage')}>%</span>}
            endAdornment={!!customSlippageTolerance && <span className={cx('percentage')}>%</span>}
          />
        </div>
      </div>
      {!!warning && <div className={cx('error')}>{warning}</div>}
    </>
  );
};

export default SlippageTolerance;
