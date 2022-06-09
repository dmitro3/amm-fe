import { ButtonBase, InputBase, Tooltip } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import classnames from 'classnames/bind';
import React, { ChangeEvent } from 'react';
import styles from 'src/features/SwapForm/styles/SwapForm.module.scss';
import { disableInvalidCharacters, disableNumberInputScroll } from '../helpers/disableInvalidNumberInput';

const cx = classnames.bind(styles);

interface SlippageToleranceProps {
  slippageTolerance: number;
  customSlippageTolerance: string;
  setSlippageTolerance: (n: number) => void;
  setCustomSlippageTolerance: (s: string) => void;
  handleCustomSlippageToleranceChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
const SlippageTolerance: React.FC<SlippageToleranceProps> = ({ ...props }) => {
  return (
    <div className={cx('slippage-tolerance')}>
      <div className={cx('label')}>
        Slippage tolerance
        <Tooltip
          arrow
          placement="top"
          classes={{ tooltip: cx('wrapper') }}
          title={
            <div className={cx('tooltip')}>
              <div>
                <div>Your transaction will revert if the price changes </div>
                <div>unfavorably by more than this percentage </div>
                <div>Maximum slippage tolerance is 90%</div>
              </div>
            </div>
          }
        >
          <HelpOutline fontSize="inherit" className={cx('icon')} />
        </Tooltip>
      </div>

      <div className={cx('button-group')}>
        <ButtonBase
          className={cx(props.slippageTolerance === 0.005 ? 'active-button' : 'button')}
          disableRipple={true}
          onClick={() => {
            props.setSlippageTolerance(0.005);
            props.setCustomSlippageTolerance('');
          }}
        >
          0.5%
        </ButtonBase>
        <ButtonBase
          className={cx(props.slippageTolerance === 0.01 ? 'active-button' : 'button')}
          disableRipple={true}
          onClick={() => {
            props.setSlippageTolerance(0.01);
            props.setCustomSlippageTolerance('');
          }}
        >
          1%
        </ButtonBase>
        <ButtonBase
          className={cx(props.slippageTolerance === 0.02 ? 'active-button' : 'button')}
          disableRipple={true}
          onClick={() => {
            props.setSlippageTolerance(0.02);
            props.setCustomSlippageTolerance('');
          }}
        >
          2%
        </ButtonBase>
        <ButtonBase
          className={cx(props.slippageTolerance === 0.05 ? 'active-button' : 'button')}
          disableRipple={true}
          onClick={() => {
            props.setSlippageTolerance(0.05);
            props.setCustomSlippageTolerance('');
          }}
        >
          5%
        </ButtonBase>
        <ButtonBase
          className={cx(props.slippageTolerance === 1 ? 'active-button' : 'button')}
          disableRipple={true}
          onClick={() => {
            props.setSlippageTolerance(1);
            props.setCustomSlippageTolerance('');
          }}
        >
          Off
        </ButtonBase>
        <InputBase
          onKeyPress={(event) => disableInvalidCharacters(event)}
          onWheel={(event) => disableNumberInputScroll(event)}
          className={cx(props.customSlippageTolerance ? 'active' : 'custom-slippage-tolerance')}
          placeholder={'Enter'}
          value={props.customSlippageTolerance}
          onChange={props.handleCustomSlippageToleranceChange}
          type={'number'}
          startAdornment={props.customSlippageTolerance && <span className={cx('hidden-percentage')}>%</span>}
          endAdornment={props.customSlippageTolerance && <span className={cx('percentage')}>%</span>}
        />
      </div>
    </div>
  );
};

export default SlippageTolerance;
