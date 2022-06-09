import {
  Box,
  Dialog,
  Grid,
  IconButton,
  InputBase,
  makeStyles,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { ChangeEvent, useEffect } from 'react';
import { CButton } from 'src/components/Base/Button';
import { COLOR_CHART } from 'src/components/Chart/constant';
import Donut from 'src/components/Chart/Donut';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import { formatFeePercent, formatPoolNumber, formatPoolPercent } from 'src/features/PoolsInfo/helpers/dataFormatter';
import {
  disableInvalidCharacters,
  disableNumberInputScroll,
} from 'src/features/SwapForm/helpers/disableInvalidNumberInput';
import { Pool, Token } from 'src/interfaces/pool';
import { TokenIcon } from 'src/pages/PoolsList/helpers/TokenIcon';
import { getUserShare } from 'src/services/pool';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { assetTypes } from '../../constants/asset-types';
import { buildProxy } from '../../helpers/proxy';
import { getUserBalance } from '../../helpers/userBalance';
import { removeMultiAssets, removeSingleAsset } from './helper/removeLiquidity';
import { calcSingleOutGivenPoolIn, denormalizeBalance, normalizeBalance } from './helper/utils';
import styles from './RemoveLiquidityModal.module.scss';
import { ReactComponent as QuestionIcon } from 'src/assets/icon/question.svg';
import { ReactComponent as RedWarningIcon } from 'src/assets/icon/red-warning.svg';
import { setSnackbarError, setSnackbarSuccess } from 'src/services/admin';

const cx = classnames.bind(styles);
const BALANCE_BUFFER = 0.01;
const SINGLE_TOKEN_THRESHOLD = 0.99;
const FPT_DECIMALS = 18;

interface RemoveLiquidityModalProps {
  modal: boolean;
  setModal: (v: boolean) => void;
  setShouldUpdateData: (v: boolean) => void;
  pool: Pool;
  series: Array<Token>;
}

enum ValidationError {
  NoError = 1,
  InsufficientLiquidity = 2,
  EmptyAmount = 3,
  Ratio = 4,
  WithdrawAll = 5,
}

const styleRadio = makeStyles(() => ({
  radio: {
    padding: '0px 8px 0px 0px',
  },
  icon: {
    boxSizing: 'border-box',
    borderRadius: '50%',
    width: 20,
    height: 20,
    backgroundColor: 'var(--bg-radio)',
    border: '1px solid var(--border-radio)',
  },
  checkedIcon: {
    border: '5px solid var(--border-radio)',
    background: 'var(--bg-checked-radio)',
  },
  label: {
    marginBottom: '0px !important',
  },
}));

export const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  modal,
  setModal,
  setShouldUpdateData,
  pool,
  series,
}) => {
  const [assetType, setAssetType] = React.useState(assetTypes.MULTI);
  const [singleAssetValue, setSingleAssetValue] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [proxy, setProxy] = React.useState<string>();
  const [userShare, setUserShare] = React.useState<string>();
  const [userLP, setUserLP] = React.useState<any>({
    absolute: {
      current: '0',
      future: '0',
    },
    relative: {
      current: '0',
      future: '0',
    },
  });
  const [poolAmountIn, setPoolAmountIn] = React.useState('');
  const [validationError, setValidationError] = React.useState(ValidationError.EmptyAmount);
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state) => state.wallet);
  const classesRadio = styleRadio();
  const coins = useAppSelector((state) => state.allCoins.coins.data);

  const tokenDecimals = (tokenAddress: string) => {
    const token: any = coins.find((coin: any) => coin?.bsc_address.toLowerCase() === tokenAddress?.toLowerCase());
    if (token) {
      return token.decimal;
    }
  };

  const changeSingleAssetValue = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setSingleAssetValue(parseInt(value));
  };

  const isBscConnected = (): boolean => {
    return !!wallet.bsc;
  };

  const getUserTokenBalance = (key: number) => {
    return new BigNumber(userLP.relative.current)
      .times(new BigNumber(pool.tokens[key].balance))
      .integerValue(BigNumber.ROUND_UP)
      .toString();
  };

  const getTokenAmountOut = (key: number) => {
    if (poolAmountIn == '' || !parseFloat(poolAmountIn)) return 0;
    if (assetType == assetTypes.MULTI) {
      return (parseFloat(pool.tokens[key].balance) / parseFloat(pool.totalShares)) * parseFloat(poolAmountIn);
    } else {
      if (singleAssetValue != key) {
        return 0;
      }
      const tokenOut = pool.tokens[singleAssetValue];
      const amount = denormalizeBalance(new BigNumber(poolAmountIn), FPT_DECIMALS);

      const tokenBalanceOut = denormalizeBalance(new BigNumber(tokenOut.balance), tokenDecimals(tokenOut.address));
      const tokenWeightOut = new BigNumber(tokenOut.denormWeight).times('1e18');
      const poolSupply = denormalizeBalance(new BigNumber(pool.totalShares), FPT_DECIMALS);
      const totalWeight = new BigNumber(pool.totalWeight).times('1e18');
      const swapFee = new BigNumber(pool.swapFee).times('1e18');

      // Need this check here as well (same as in validationError)
      // Otherwise, if amount > poolSupply, ratio is negative, and bpowApprox will not converge
      if (amount.div(poolSupply).gt(SINGLE_TOKEN_THRESHOLD)) {
        return 0;
      }
      const tokenAmountOut = calcSingleOutGivenPoolIn(
        tokenBalanceOut,
        tokenWeightOut,
        poolSupply,
        totalWeight,
        amount,
        swapFee,
      );
      const tokenAmountNormalized = normalizeBalance(tokenAmountOut, tokenDecimals(tokenOut.address));
      return tokenAmountNormalized.toNumber();
    }
  };

  const getPoolLP = async (): Promise<string> => {
    let poolTokenBalance;
    if (!pool.crp) {
      poolTokenBalance = await getUserBalance(wallet.bsc, pool.id);
    } else {
      poolTokenBalance = await getUserBalance(wallet.bsc, pool.controller);
    }
    return poolTokenBalance.toString();
  };

  const getUserLP = async (): Promise<any> => {
    const poolTokenBalance = await getPoolLP();
    const currentLP = normalizeBalance(new BigNumber(poolTokenBalance) || '0', FPT_DECIMALS);
    const currentRatio = currentLP.div(new BigNumber(pool.totalShares));
    setUserLP({
      absolute: {
        current: currentLP.toString(),
        future: '',
      },
      relative: {
        current: currentRatio.toString(),
        future: '',
      },
    });
  };

  const getUserSharePool = async () => {
    const userSharePool = await getUserShare(pool.id, wallet.bsc);
    const totalPoolShares = new BigNumber(pool.totalShares);
    const result = new BigNumber(userSharePool).div(totalPoolShares).times(100);
    setUserShare(result.toString());
  };

  // const getProxy = async () => {
  //   const check = await isProxyExist(wallet.bsc);
  //   if (check) {
  //     const userProxy = await buildProxy(wallet.bsc);
  //     setProxy(userProxy);
  //   }
  // };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const handleProxy = async () => {
    const proxy = await buildProxy(wallet.bsc);
    setProxy(proxy);
  };

  const calculateUserLiquidity = () => {
    const poolSharesFrom = parseFloat(userLP.absolute.current);
    const totalShares = parseFloat(pool.totalShares);
    const currentRatio = poolSharesFrom / totalShares;
    const poolTokens = parseFloat(poolAmountIn);
    const futureRatio = (poolSharesFrom - poolTokens) / (totalShares - poolTokens);
    setUserLP({
      absolute: {
        current: poolSharesFrom.toString(),
        future: (poolSharesFrom + poolTokens).toString(),
      },
      relative: {
        current: currentRatio,
        future: futureRatio,
      },
    });
  };

  const handleValidation = (value: string) => {
    if (!value) {
      setValidationError(ValidationError.EmptyAmount);
      return;
    }
    if (assetType === assetTypes.SINGLE) {
      const tokenOut = pool.tokens[singleAssetValue];
      const maxOutRatio = 1 / 3;
      const amount = denormalizeBalance(new BigNumber(value), tokenDecimals(tokenOut.address));
      const tokenBalanceOut = denormalizeBalance(new BigNumber(tokenOut.balance), tokenDecimals(tokenOut.address));
      const tokenWeightOut = new BigNumber(tokenOut.denormWeight).times('1e18');
      const poolSupply = denormalizeBalance(new BigNumber(pool.totalShares), FPT_DECIMALS);
      const totalWeight = new BigNumber(pool.totalWeight).times('1e18');
      const swapFee = new BigNumber(pool.swapFee).times('1e18');

      if (amount.div(poolSupply).gt(SINGLE_TOKEN_THRESHOLD)) {
        // Invalidate user's attempt to withdraw the entire pool supply in a single token
        // At amounts close to 100%, solidity math freaks out
        setValidationError(ValidationError.InsufficientLiquidity);
        return;
      }
      const tokenAmountOut = calcSingleOutGivenPoolIn(
        tokenBalanceOut,
        tokenWeightOut,
        poolSupply,
        totalWeight,
        amount,
        swapFee,
      );
      if (tokenAmountOut.div(tokenBalanceOut).gt(maxOutRatio)) {
        setValidationError(ValidationError.Ratio);
        return;
      }
    } else {
      if (value === pool.totalShares && assetType === assetTypes.MULTI) {
        setValidationError(ValidationError.WithdrawAll);
        return;
      }
    }
    setValidationError(ValidationError.NoError);
  };

  const handleChangePoolAmountIn = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value != undefined) {
      setPoolAmountIn(e.target.value.toString());
      calculateUserLiquidity();
      handleValidation(e.target.value);
    }
  };

  const handleMax = () => {
    setPoolAmountIn(userLP.absolute.current);
    handleValidation(userLP.absolute.current);
  };

  useEffect(() => {
    if (pool.id && wallet.bsc) {
      getUserLP();
      getUserSharePool();
    }
  }, [wallet.bsc, pool]);

  // useEffect(() => {
  //   if (pool.id && wallet.bsc) {
  //     getUserLP();
  //     getUserSharePool();
  //   }
  // }, [totalShare]);

  const updateUser = () => {
    if (pool.id && wallet.bsc) {
      getUserLP().then();
      getUserSharePool().then();
    }
  };

  useEffect(() => {
    updateUser();
  }, [modal]);

  const handleCloseDialog = () => {
    setPoolAmountIn('');
    setSingleAssetValue(0);
    setModal(false);
    setValidationError(ValidationError.NoError);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let result = false;
    try {
      if (assetType == assetTypes.MULTI) {
        const denormPoolAmountIn = denormalizeBalance(new BigNumber(poolAmountIn), FPT_DECIMALS);
        const params = {
          poolAddress: pool.crp ? pool.controller : pool.id,
          poolAmountIn: denormPoolAmountIn.toString(),
          minAmountsOut: pool.tokens.map(() => '0'),
          isCrp: pool.crp,
          account: wallet.bsc,
        };
        result = await removeMultiAssets(params);
      } else {
        const denormPoolAmountIn = denormalizeBalance(new BigNumber(poolAmountIn), FPT_DECIMALS);
        const tokenOutKey = singleAssetValue;
        const tokenOut = pool.tokens[tokenOutKey];
        const minTokenAmountOut = denormalizeBalance(
          new BigNumber(await getTokenAmountOut(tokenOutKey)),
          tokenDecimals(tokenOut.address),
        )
          .times(1 - BALANCE_BUFFER)
          .integerValue(BigNumber.ROUND_UP)
          .toString();
        const params = {
          poolAddress: pool.crp ? pool.controller : pool.id,
          tokenOutAddress: tokenOut.address,
          poolAmountIn: denormPoolAmountIn.toString(),
          minTokenAmountOut: minTokenAmountOut,
          isCrp: pool.crp,
          account: wallet.bsc,
        };
        result = await removeSingleAsset(params);
      }

      setShouldUpdateData(true);
      // getTotalShare();
      updateUser();
      setIsLoading(false);
      handleCloseDialog();

      if (result) {
        setSnackbarSuccess('You have successfully removed liquidity!');
      } else {
        setSnackbarError('Transaction failed');
      }
    } catch (e) {
      const message = e.code == 4001 ? 'Transaction rejected' : 'Transaction failed';
      setSnackbarError(message);
      setIsLoading(false);
    }
  };

  const shouldDisableCloseDialog = (event: Record<string, unknown>, reason: 'backdropClick' | 'escapeKeyDown') => {
    reason === 'backdropClick' && !isLoading && handleCloseDialog();
  };

  const isMaxExceeded = () => {
    return (poolAmountIn && new BigNumber(poolAmountIn).gt(userLP.absolute.current)) || false;
  };

  const clearData = () => {
    setPoolAmountIn('');
    setSingleAssetValue(0);
    setValidationError(ValidationError.EmptyAmount);
  };

  const changeAssetType = (event: React.ChangeEvent<Record<string, never>>, newValue: number) => {
    setAssetType(newValue);
    clearData();
  };

  return (
    <Dialog
      open={modal}
      onClose={shouldDisableCloseDialog}
      className={cx('remove-liquidity-modal')}
      style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
    >
      <Grid container alignItems="center" className={cx('header')}>
        <Grid item xs={1} />
        <Grid item xs={10}>
          <Typography variant="h5" className={cx('header__title')}>
            Remove liquidity
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <IconButton
            onClick={() => {
              !isLoading && handleCloseDialog();
            }}
          >
            <CloseIcon style={{ fill: 'var(--color-body)' }} />
          </IconButton>
        </Grid>
      </Grid>
      <Box className={cx('content')}>
        <form>
          <div className={cx('content__assets-button')}>
            <Tabs value={assetType} onChange={changeAssetType} className="assets-button">
              <Tab label="Multi asset" />
              <Tab label="Single asset" />
            </Tabs>
          </div>
          <div className={cx('content__pool-overview')}>
            <div className={cx('chart')}>
              <Donut
                series={series.map((item) => new BigNumber(item.denormWeight).toNumber())}
                colors={series.map((item) => COLOR_CHART[item.symbol])}
                widthChart={100}
              ></Donut>
            </div>
            <div>
              <span className={cx('pool-overview')}>POOL OVERVIEW</span>
              <div className={cx('info')}>
                <div className={cx('tokens-list')}>
                  <div className={cx('item')}>{pool.id.substr(0, 6) + '...' + pool.id.substr(pool.id.length - 4)}</div>
                  {pool?.tokens?.map((item, key) => {
                    return (
                      <div className={cx('item')} key={key}>
                        <div className={cx('circle')} style={{ backgroundColor: COLOR_CHART[item.symbol] }} />
                        <span>
                          {formatPoolPercent(parseInt(item.denormWeight) / parseInt(pool.totalWeight), 2)}%{' '}
                          {item.symbol}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className={cx('other')}>
                  <div>
                    My share: {formatPoolNumber(userShare || '')}
                    {userShare && '%'}
                  </div>
                  <div>Swap fee: {formatFeePercent(pool.swapFee) + '%'}</div>
                  <ul className={cx('fee-list')}>
                    <li>Velo admin: {formatFeePercent(pool.protocolFee) + '%'}</li>
                    <li>Liquidity provider: {formatFeePercent(pool.netFee) + '%'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className={cx('content__assets-table')}>
            {assetType == assetTypes.SINGLE ? (
              <RadioGroup value={singleAssetValue} onChange={changeSingleAssetValue}>
                <table>
                  <thead>
                    <tr>
                      <th className={cx('assets')}>Asset</th>
                      <th>My pool balance</th>
                      <th>Remove amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pool?.tokens?.map((token, key) => {
                      return (
                        <tr key={key}>
                          <td>
                            <div className={cx('radio-container')}>
                              <Radio
                                color="primary"
                                value={key}
                                disableRipple
                                className={classesRadio.radio}
                                icon={<span className={classesRadio.icon} />}
                                checkedIcon={<span className={cx(classesRadio.icon, classesRadio.checkedIcon)} />}
                              ></Radio>
                              <TokenIcon name={token.symbol} size={20} />
                              <span className={cx('token-symbol')}>{token.symbol}</span>
                            </div>
                          </td>
                          <td>{getUserTokenBalance(key)}</td>
                          <td>
                            <div>
                              {getTokenAmountOut(key).toString()}
                              {validationError === ValidationError.Ratio && singleAssetValue === key && (
                                <div className={cx('error')}>Amount can not exceed 1/3 of the current pool balance</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </RadioGroup>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className={cx('assets')}>Asset</th>
                    <th>My pool balance</th>
                    <th>Remove amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pool?.tokens?.map((token, key) => {
                    return (
                      <tr key={key}>
                        <td>
                          <div className={cx('radio-container')}>
                            <TokenIcon name={token.symbol} size={20} />
                            <span className={cx('token-symbol')}>{token.symbol}</span>
                          </div>
                        </td>
                        <td>{getUserTokenBalance(key)}</td>
                        <td>{getTokenAmountOut(key).toString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className={cx('content__amount')}>
            <div className={cx('label')}>Amount</div>
            <div className={cx('value')}>
              <div>
                {formatPoolNumber(userLP.absolute.current, 7)} {pool.symbol}
              </div>
              <button type="button" onClick={handleMax}>
                Max
              </button>
            </div>
            <Box display="flex" flexDirection="column" className={cx('input')}>
              <InputBase
                value={poolAmountIn}
                type="number"
                onChange={handleChangePoolAmountIn}
                onKeyPress={disableInvalidCharacters}
                onWheel={disableNumberInputScroll}
                placeholder="0.0"
              />
              {isMaxExceeded() && <div className={cx('error')}>Max {userLP.absolute.current}</div>}
            </Box>
          </div>
          {validationError === ValidationError.EmptyAmount && (
            <div className={cx('content__red-warning')}>
              <RedWarningIcon />
              <div>{`Amount can't be empty`}</div>
            </div>
          )}
          {validationError === ValidationError.WithdrawAll && (
            <div className={cx('content__red-warning')}>
              <RedWarningIcon />
              <div>{`Sorry, you can't remove all liquidity of a pool`}</div>
            </div>
          )}
        </form>
      </Box>
      <div className={cx('footer')}>
        {!isBscConnected() && (
          <CButton
            content="Connect wallet"
            onClick={handleOpenConnectDialog}
            type="primary"
            size="md"
            fullWidth={true}
          />
        )}
        {isBscConnected() && proxy === '' && (
          <>
            <CButton
              content="Setup proxy"
              type="primary"
              size="md"
              fullWidth={true}
              onClick={handleProxy}
              isLoading={isLoading}
            />
            <div className={cx('tooltip')}>
              <Tooltip
                arrow
                interactive
                title={`You need to create proxy contract to manage liquidity on FCX. 
                This is a one-time action and will save you gas in the long-term.`}
              >
                <div className={cx('custom-tooltip')}>
                  <div>Setup proxy</div>
                  <QuestionIcon />
                </div>
              </Tooltip>
            </div>
          </>
        )}
        {isBscConnected() && proxy !== '' && (
          <CButton
            content="Remove"
            onClick={handleSubmit}
            type="primary"
            size="md"
            fullWidth={true}
            isDisabled={validationError !== ValidationError.NoError || isMaxExceeded()}
            isLoading={isLoading}
          />
        )}
      </div>
    </Dialog>
  );
};
