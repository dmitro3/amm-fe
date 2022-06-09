import { Box, Grid, Typography } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import _ from 'lodash';
import React from 'react';
import { CButton } from 'src/components/Base/Button';
import { currencySelector } from 'src/helpers/functional-currency';
import { Pool } from 'src/interfaces/pool';
import { useAppSelector } from 'src/store/hooks';
import { formatCurrencyAmount, formatCurrencyPercent, getMyInfor } from './helper';
import styles from './MyInfo.module.scss';

const cx = classnames.bind(styles);
interface MyInfoProps {
  pool: Pool;
}

const ZERO = new BigNumber(0);
interface MyInforData {
  feeAmount: BigNumber;
  feePercent: BigNumber;
  loss: BigNumber;
  lossPercent: BigNumber;
}

const defaultData = {
  feeAmount: ZERO,
  feePercent: ZERO,
  loss: ZERO,
  lossPercent: ZERO,
};

export const MyInfo: React.FC<MyInfoProps> = ({ pool }) => {
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const wallet = useAppSelector((state) => state.wallet);
  const selectedCurrency = useAppSelector(currencySelector);
  const [myInfor, setMyInfor] = React.useState<MyInforData>(defaultData);
  const [loading, setLoading] = React.useState(false);
  // const feeAmount = new BigNumber(pool.totalShares).gt('0')
  //   ? new BigNumber(pool.myShareBalance).div(pool.totalShares).times(pool.totalSwapFee).toString()
  //   : '0';
  // const accFeeValue = formatCurrencyAmount(feeAmount, selectedCurrency, exchangeRates);
  // const accFeePercentReturn = formatPoolNumber(
  //   new BigNumber(pool.liquidity).gt('0') ? new BigNumber(pool.totalSwapFee).div(pool.liquidity).toString() : '0',
  // );

  const getMyInforData = async () => {
    const data = await getMyInfor(wallet.bsc, pool.id);
    if (data && !_.isEmpty(data)) {
      const swapFee = new BigNumber(data.swapFee);
      const swapFeePercent = swapFee.div(new BigNumber(pool.myLiquidity)).times(new BigNumber(100));
      const loss = new BigNumber(data.loss).plus(swapFee);
      const lossPercent = loss.div(new BigNumber(pool.myLiquidity)).times(100);
      setMyInfor({
        feeAmount: swapFee,
        feePercent: swapFeePercent,
        loss: loss,
        lossPercent: lossPercent,
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    getMyInforData().then(() => setLoading(false));
  };

  React.useEffect(() => {
    if (wallet.bsc && pool.id) {
      getMyInforData();
    }
  }, [wallet.bsc, pool.id, pool.myLiquidity]);

  return (
    <>
      <div className={cx('my-info')}>
        <Grid container>
          <Grid item xs={4} className={cx('item')}>
            <Typography gutterBottom>My accumulated fee value</Typography>
            <span className={cx('item__value')}>
              {formatCurrencyAmount(myInfor.feeAmount, selectedCurrency, exchangeRates, '-', 1)}
            </span>
          </Grid>
          <Grid item xs={8} className={cx('item')}>
            <Box display="flex" justifyContent="space-between">
              <div>
                <Typography gutterBottom>My accumulated fee after impermanent loss/gain value</Typography>
                <span className={cx('item__value')}>
                  {formatCurrencyAmount(myInfor.loss, selectedCurrency, exchangeRates)}
                </span>
              </div>
              <div className={cx('button')}>
                <CButton content="Update" size="md" type="primary" isLoading={loading} onClick={() => handleUpdate()} />
              </div>
            </Box>
          </Grid>
          <Grid item xs={4} className={cx('item')}>
            <Typography gutterBottom>My accumulated fee percentage return</Typography>
            <span className={cx('item__value')}>{formatCurrencyPercent(myInfor.feePercent)}</span>
          </Grid>
          <Grid item xs={8} className={cx('item')}>
            <Typography gutterBottom>My accumulated fee after impermanent loss/gain percentage return</Typography>
            <span className={cx('item__value')}>{formatCurrencyPercent(myInfor.lossPercent)}</span>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
