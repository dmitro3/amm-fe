import { Tooltip } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React from 'react';
import BscSVG from 'src/assets/icon/BscSVG';
import OutlinedQuestionMark from 'src/assets/icon/OutlinedQuestionMark';
import StellarSVG from 'src/assets/icon/StellarSVG';
import { useAppSelector } from 'src/store/hooks';
import styles from './FeeTooltip.module.scss';

const cx = classnames.bind(styles);

const FeeTooltip: React.FC = () => {
  const tradingFee = useAppSelector((state) => state.orderForm.tradingFee);

  return (
    <>
      <Tooltip
        title={
          <>
            <div>Trading fees for order book</div>
            <div className={cx('data')}>
              <div className={cx('stellar')}>
                <div className={cx('market')}>
                  <StellarSVG />
                  <div>Market order: {new BigNumber(tradingFee.stellarMarketOrder).times(100).dp(2).toString()}%</div>
                </div>
                <div className={cx('limit')}>
                  <StellarSVG />
                  <div>Limit order: {new BigNumber(tradingFee.stellarLimitOrder).times(100).dp(2).toString()}%</div>
                </div>
              </div>
              <div className={cx('bsc')}>
                <div className={cx('market')}>
                  <BscSVG />
                  <div>Market order: {new BigNumber(tradingFee.bscMarketOrder).times(100).dp(2).toString()}%</div>
                </div>
                <div className={cx('limit')}>
                  <BscSVG />
                  <div>Limit order: {new BigNumber(tradingFee.bscLimitOrder).times(100).dp(2).toString()}%</div>
                </div>
              </div>
            </div>
            <div>Trading fees for liquidity pool are specific to each pool</div>
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
    </>
  );
};

export default FeeTooltip;
