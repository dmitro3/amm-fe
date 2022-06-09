import { Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import copyIcon from 'src/assets/icon/copy.svg';
import { COLOR_CHART } from 'src/components/Chart/constant';
import Donut from 'src/components/Chart/Donut';
import CLoading from 'src/components/Loading';
import { currencySelector } from 'src/helpers/functional-currency';
import { Pool, Token } from 'src/interfaces/pool';
import { FEE_TYPE } from 'src/pages/PoolsList/constants';
import { useAppSelector } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { calcAPY } from '../../helpers/apy';
import { formatCurrencyAmount, formatPoolNumber, formatPoolPercent } from '../../helpers/dataFormatter';
import { formatPoolId } from '../../helpers/poolId';
import styles from './Header.module.scss';

interface HeaderProps {
  pool: Pool;
  feeType: number;
  series: Array<Token>;
}

const cx = classnames.bind(styles);
const Header: FC<HeaderProps> = ({ pool, feeType, series }) => {
  const dispatch = useDispatch();
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);

  const volume24h = new BigNumber(pool.totalSwapVolume).minus(pool.swaps[0]?.poolTotalSwapVolume || 0).toString();
  const isGrossFee = feeType === FEE_TYPE.GROSS;
  const poolTotalFee = feeType === FEE_TYPE.GROSS ? 'totalSwapFee' : 'totalNetFee';
  const swapTotalFee = feeType === FEE_TYPE.GROSS ? 'poolTotalSwapFee' : 'poolTotalNetFee';

  let fees24h = '0';
  let swapFeeLast24h = '0';
  if (pool.swaps?.length) {
    swapFeeLast24h = pool.swaps[0][swapTotalFee];
  }
  fees24h = new BigNumber(pool[poolTotalFee]).minus(swapFeeLast24h).toString();

  const apy = formatPoolNumber(calcAPY(fees24h, pool.liquidity).toString());
  return (
    <>
      <div className={cx('header')}>
        {!pool.id ? (
          <div className={cx('loading')}>
            <CLoading size="md" type="spin" />
          </div>
        ) : (
          <div className={cx('wrapper')}>
            <Box display="flex" flexDirection="row">
              <div className={cx('donut-chart')}>
                <Donut
                  widthChart={80}
                  series={series.map((item) => new BigNumber(item.denormWeight).toNumber())}
                  colors={series.map((item) => COLOR_CHART[item.symbol])}
                />
              </div>
              <div className={cx('pool-name')}>
                <Typography variant="h5">{pool.name || 'FCX Pool Token'}</Typography>
                <p className={cx('pool-id')}>
                  {formatPoolId(pool.id)}
                  <img
                    src={copyIcon}
                    onClick={() => {
                      navigator.clipboard.writeText(pool.id);
                      dispatch(
                        openSnackbar({
                          message: 'Copied!',
                          variant: SnackbarVariant.SUCCESS,
                        }),
                      );
                    }}
                  ></img>
                </p>
              </div>
            </Box>
            <div className={cx('pool-type')}>{pool.crp ? 'Flexible pool' : 'Fixed pool'}</div>

            <div className={cx('pool-info')}>
              <div className={cx('pair')}>
                <div className={cx('value')}>
                  {formatCurrencyAmount(pool.liquidity, selectedCurrency, exchangeRates)}
                </div>
                <div className={cx('label')}>Liquidity</div>
              </div>
              <div className={cx('pair')}>
                <div className={cx('value')}>{formatCurrencyAmount(volume24h, selectedCurrency, exchangeRates)}</div>
                <div className={cx('label')}>Volume (24h)</div>
              </div>
              <div className={cx('pair')}>
                <div className={cx('value')}>{formatPoolPercent(isGrossFee ? pool.swapFee : pool.netFee, 2, '0')}%</div>
                <div className={cx('label')}>Swap fee</div>
              </div>
              <div className={cx('pair')}>
                <div className={cx('value')}>
                  {formatCurrencyAmount(pool.myLiquidity, selectedCurrency, exchangeRates)}
                </div>
                <div className={cx('label')}>My liquidity</div>
              </div>
              <div className={cx('pair')}>
                <div className={cx('value')}>
                  {apy} {apy == '-' ? '' : '%'}
                </div>
                <div className={cx('label')}>APY</div>
              </div>
              <div className={cx('pair')}>
                <div className={cx('value')}>
                  {formatCurrencyAmount(
                    isGrossFee ? pool.totalSwapFee : pool.totalNetFee,
                    selectedCurrency,
                    exchangeRates,
                  )}
                </div>
                <div className={cx('label')}>Lifetime fees</div>
              </div>
              <div className={cx('pair')}>
                <div className={cx('value')}>{pool.shares.length}</div>
                <div className={cx('label')}>Number of LPer</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
