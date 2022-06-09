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
import React, { ChangeEvent, useEffect, useState } from 'react';
import { CButton } from 'src/components/Base/Button';
import { COLOR_CHART } from 'src/components/Chart/constant';
import Donut from 'src/components/Chart/Donut';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import { zeroAddress } from 'src/features/PoolsInfo/constants/address';
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
import { buildProxy, getUserProxy } from '../../helpers/proxy';
import { approve, checkApprove, getUserBalance } from '../../helpers/userBalance';
import WarningPopup from '../WarningPopup/WarningPopup';
import styles from './AddLiquidityModal.module.scss';
import { addMultiAssets, addSingleAsset, formatBalance } from './helper/addLiquidity';
import {
  calcPoolOutGivenSingleIn,
  calcPoolTokensByRatio,
  canProvideLiquidity,
  denormalizeBalance,
  getPoolCap,
  getPoolTokens,
  normalizeBalance,
} from './helper/utils';
import { ReactComponent as QuestionIcon } from 'src/assets/icon/question.svg';
import { ReactComponent as RedWarningIcon } from 'src/assets/icon/red-warning.svg';
import { setSnackbarError, setSnackbarSuccess } from 'src/services/admin';

const cx = classnames.bind(styles);
const BALANCE_BUFFER = 0.01;
const FPT_DECIMALS = 18;
interface AddLiquidityModalProps {
  modal: boolean;
  setModal: (v: boolean) => void;
  setShouldUpdateData: (v: boolean) => void;
  pool: Pool;
  series: Array<Token>;
}

interface WalletStatus {
  state: WalletState;
  proxy: string;
  unapprovedToken: {
    address: string;
    symbol: string;
  };
}

enum WalletState {
  Unknown = 1,
  NeedProxy = 2,
  CanChangeLiquidity = 4,
}

enum ValidationError {
  NO_ERR = 0,
  EMPTY_AMOUNTS = 1,
  RATIO = 2,
  EXCEED_BALANCE = 3,
}

const defaultWalletState = {
  state: WalletState.Unknown,
  proxy: '',
  unapprovedToken: { address: '', symbol: '' },
};

export interface TokenApprove {
  [tokenAddress: string]: boolean;
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

export const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({
  modal,
  setModal,
  pool,
  setShouldUpdateData,
  series,
}) => {
  const [assetType, setAssetType] = React.useState(assetTypes.MULTI);
  const [singleAssetValue, setSingleAssetValue] = React.useState(0);
  const wallet = useAppSelector((state) => state.wallet);
  const [userBalance, setUserBalance] = React.useState<string[]>(new Array<string>(pool.tokens.length));
  const [userShare, setUserShare] = React.useState<string>();
  const [amounts, setAmounts] = React.useState<string[]>(new Array<string>(pool.tokens.length));
  const [poolTokens, setPoolTokens] = React.useState<string>('0');
  const dispatch = useAppDispatch();
  const [validationError, setValidationError] = React.useState(ValidationError.EMPTY_AMOUNTS);
  const [userLP, setUserLP] = React.useState<any>({
    absolute: {
      current: '',
      future: '',
    },
    relative: {
      current: '',
      future: '',
    },
  });
  const [currentTokens, setCurrentTokens] = React.useState<string[]>([]);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>(defaultWalletState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [poolCap, setPoolCap] = useState<string>('');
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(true);
  const [openWarningPopup, setOpenWarningPopup] = useState<boolean>(false);
  const [warningMessae, setWarningMessage] = useState<string>('');
  const [tokenApproved] = React.useState<TokenApprove>({});
  const coins = useAppSelector((state) => state.allCoins.coins.data);
  const [tokenApprovedLoading, setTokenApprovedLoading] = React.useState(
    pool.tokens.reduce((prev, token) => {
      prev[token.address] = false;
      return prev;
    }, {} as Record<string, boolean>),
  );
  const classesRadio = styleRadio();

  const tokenDecimals = (tokenAddress: string) => {
    const token: any = coins.find((coin: any) => coin?.bsc_address.toLowerCase() === tokenAddress?.toLowerCase());
    if (token) {
      return token.decimal;
    }
  };

  const changeAssetType = (event: React.ChangeEvent<Record<string, never>>, newValue: number) => {
    setAssetType(newValue);
    setSingleAssetValue(0);
  };

  const userBalances = async (): Promise<any> => {
    const balances: Array<string> = [];
    pool.tokens.map(async (token) => {
      if (wallet.bsc != '') {
        const tokenBalance = await getUserBalance(wallet.bsc, token.address);
        balances.push(tokenBalance);
      } else {
        balances.push('0');
      }
    });
    setUserBalance(balances);
  };

  const getCurrentToken = async () => {
    const tokens = await getPoolTokens(pool.id);
    setCurrentTokens(tokens);
  };

  const getCap = async () => {
    if (pool.crp) {
      const cap = await getPoolCap(pool.controller);
      setPoolCap(cap);
    }
  };

  const checkWhitelist = async () => {
    if (pool.crp) {
      setIsWhitelisted(await canProvideLiquidity(wallet.bsc, pool.controller));
    }
  };

  const isBscConnected = (): boolean => {
    return !!wallet.bsc;
  };

  const getUserLP = async (): Promise<any> => {
    const poolTokenAddress = pool.crp ? pool.controller : pool.id;
    const poolTokenBalance = await getUserBalance(wallet.bsc, poolTokenAddress);
    const currentLP = normalizeBalance(new BigNumber(poolTokenBalance), FPT_DECIMALS);
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

  const updateWalletStatus = async () => {
    if (!wallet.bsc) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.Unknown });
      return;
    }
    const proxy = await getUserProxy(wallet.bsc);
    if (proxy === zeroAddress) {
      setWalletStatus({ ...defaultWalletState, state: WalletState.NeedProxy });
      return;
    }

    for (const token of pool.tokens) {
      const isApproved = await checkApprove(wallet.bsc, proxy, token.address);
      tokenApproved[token.address] = isApproved;
    }

    setWalletStatus({ ...defaultWalletState, state: WalletState.CanChangeLiquidity, proxy });
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  useEffect(() => {
    if (pool.id) {
      getCurrentToken().then();
      getCap().then();
    }
    if (wallet.bsc && pool.id) {
      userBalances();
      getUserLP();
      getUserSharePool();
      checkWhitelist().then();
    }
    updateWalletStatus().then();
  }, [wallet.bsc, pool.id]);

  const updateUser = async () => {
    if (wallet.bsc && pool.id) {
      await userBalances();
      await getUserLP();
      await getUserSharePool();
      await checkWhitelist();
    }
  };

  const handleProxy = async () => {
    setIsLoading(true);
    try {
      await buildProxy(wallet.bsc);
      await updateWalletStatus();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const calculateLiquidity = () => {
    const totalShares = parseFloat(pool.totalShares);
    const poolSharesFrom = parseFloat(userLP.absolute.current);
    const currentRatio = poolSharesFrom / totalShares;

    const poolToken = new BigNumber(poolTokens).div('1e18').toNumber();
    const futureRatio = (poolSharesFrom + poolToken) / (totalShares + poolToken);
    setUserLP({
      absolute: {
        current: poolSharesFrom.toString(),
        future: (poolSharesFrom + poolToken).toString(),
      },
      relative: {
        current: currentRatio.toString(),
        future: futureRatio.toString(),
      },
    });
  };

  const calculateDeposit = (key: number, value: BigNumber) => {
    if (value.isEqualTo(0)) {
      const inputs = pool.tokens.map(() => {
        return '';
      });
      setAmounts(inputs);
      setPoolTokens('0');
      return;
    }
    const ratio = value.div(new BigNumber(pool.tokens[key].balance)).toFixed(18);
    // const ratio = bdiv(value, new BigNumber(pool.tokens[key].balance));
    const deposits: Array<string> = [];
    pool.tokens.map((token, index) => {
      let tokenAmount: BigNumber;
      if (index == key) {
        tokenAmount = value;
        deposits.push(tokenAmount.toString());
      } else {
        tokenAmount = new BigNumber(token.balance).times(ratio);
        deposits.push(tokenAmount.toString());
      }
    });
    setAmounts(deposits);
    if (assetType == assetTypes.MULTI) {
      const result = calcPoolTokensByRatio(new BigNumber(ratio), pool.totalShares);
      setPoolTokens(result.toString());
    } else {
      const tokenIn = pool.tokens[key];
      const amount = value;

      const maxRatio = 1 / 2;
      if (new BigNumber(amount).div(pool.tokens[key].balance).gt(maxRatio)) {
        setPoolTokens('0');
        return;
      }

      const tokenBalanceIn = denormalizeBalance(new BigNumber(tokenIn.balance), tokenDecimals(tokenIn.address));
      const tokenWeightIn = new BigNumber(tokenIn.denormWeight).times('1e18');
      const poolSupply = denormalizeBalance(new BigNumber(pool.totalShares), FPT_DECIMALS);
      const totalWeight = new BigNumber(pool.totalWeight).times('1e18');
      const tokenAmountIn = denormalizeBalance(new BigNumber(amount), tokenDecimals(tokenIn.address)).integerValue(
        BigNumber.ROUND_UP,
      );
      const swapFee = new BigNumber(pool.swapFee).times('1e18');
      const result = calcPoolOutGivenSingleIn(
        tokenBalanceIn,
        tokenWeightIn,
        poolSupply,
        totalWeight,
        tokenAmountIn,
        swapFee,
      ).toString();
      setPoolTokens(result);
    }
  };

  const isMaxExceeded = (key: number) => {
    return (
      amounts[key] &&
      new BigNumber(amounts[key]).gt(
        normalizeBalance(new BigNumber(userBalance[key] || '0'), tokenDecimals(pool.tokens[key].address)),
      )
    );
  };

  const handleValidation = (value: string, key: number): number => {
    if (!value) {
      setValidationError(ValidationError.EMPTY_AMOUNTS);
      return ValidationError.EMPTY_AMOUNTS;
    }
    if (
      new BigNumber(value).gt(
        normalizeBalance(new BigNumber(userBalance[key]), tokenDecimals(pool.tokens[key].address)),
      )
    ) {
      setValidationError(ValidationError.EXCEED_BALANCE);
      return ValidationError.EXCEED_BALANCE;
    }
    if (assetType === assetTypes.SINGLE) {
      const ratio = new BigNumber(value).div(new BigNumber(pool.tokens[key].balance));
      const maxRatio = 1 / 2;
      if (ratio.gt(maxRatio)) {
        setValidationError(ValidationError.RATIO);
        return ValidationError.RATIO;
      }
    }
    setValidationError(ValidationError.NO_ERR);
    return ValidationError.NO_ERR;
  };

  const handleChange = (key: number) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== undefined) {
      if (e.target.value === '') {
        calculateDeposit(key, new BigNumber(0));
      } else {
        calculateDeposit(key, new BigNumber(e.target.value));
      }
      calculateLiquidity();
      handleValidation(e.target.value, key);
    }
  };

  const handleMax = (key: number) => {
    const balance = userBalance[key];
    const amount = normalizeBalance(new BigNumber(balance), tokenDecimals(pool.tokens[key].address));
    calculateDeposit(key, amount);
    setSingleAssetValue(key);
    if (assetType == assetTypes.SINGLE) handleValidation(amount.toString(), key);
  };

  const approveToken = async (tokenAddress: string) => {
    setTokenApprovedLoading((prev) => ({ ...prev, [tokenAddress]: true }));
    try {
      await approve(wallet.bsc, walletStatus.proxy, tokenAddress);
      await updateWalletStatus();
      setTokenApprovedLoading((prev) => ({ ...prev, [tokenAddress]: false }));
    } catch (e) {
      setTokenApprovedLoading((prev) => ({ ...prev, [tokenAddress]: false }));
      throw e;
    }
  };

  const clearData = () => {
    setAmounts(new Array<string>(pool.tokens.length).fill(''));
    setPoolTokens('0');
    setValidationError(ValidationError.EMPTY_AMOUNTS);
  };

  const changeSingleAssetValue = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setSingleAssetValue(parseInt(value));
    clearData();
  };

  const handleCloseDialog = () => {
    setModal(false);
    setSingleAssetValue(0);
    clearData();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let result = false;
      if (assetType == assetTypes.MULTI) {
        const params = {
          poolAddress: pool.crp ? pool.controller : pool.id,
          poolAmountOut: poolTokens,
          maxAmountsIn: currentTokens.map((tokenAddress) => {
            const token = pool.tokens.find((token) => token.address === tokenAddress.toLowerCase());
            if (token) {
              const key = pool.tokens.indexOf(token);
              const amount = new BigNumber(amounts[key]);
              const inputAmountIn = denormalizeBalance(amount, tokenDecimals(token.address))
                .div(1 - 0.02)
                .integerValue(BigNumber.ROUND_UP);
              const balanceAmountIn = new BigNumber(userBalance[key]);
              const tokenAmountIn = BigNumber.min(inputAmountIn, balanceAmountIn);
              return tokenAmountIn.toString();
            }
            return '';
          }),
          account: wallet.bsc,
          isCrp: pool.crp,
        };
        result = await addMultiAssets(params);
      } else {
        const key = singleAssetValue;
        const tokenIn = pool.tokens[key];
        const tokenAmountIn = denormalizeBalance(new BigNumber(amounts[key]), tokenDecimals(tokenIn.address))
          .integerValue(BigNumber.ROUND_UP)
          .toString();
        const minPoolAmountOut = new BigNumber(poolTokens)
          .times(1 - BALANCE_BUFFER)
          .integerValue(BigNumber.ROUND_UP)
          .toString();
        const params = {
          poolAddress: pool.crp ? pool.controller : pool.id,
          tokenInAddress: tokenIn.address,
          tokenAmountIn: tokenAmountIn,
          minPoolAmountOut: minPoolAmountOut,
          account: wallet.bsc,
        };
        result = await addSingleAsset(params);
      }

      setShouldUpdateData(true);
      clearData();
      await updateUser();
      setIsLoading(false);
      handleCloseDialog();

      if (result) {
        setSnackbarSuccess('You have successfully added liquidity!');
      } else {
        setSnackbarError('Transaction failed');
      }
    } catch (e) {
      const message = e.code == 4001 ? 'Transaction rejected' : 'Transaction failed';
      setSnackbarError(message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    clearData();
  }, [assetType]);

  useEffect(() => {
    updateUser();
  }, [modal]);

  useEffect(() => {
    if (assetType == assetTypes.MULTI) {
      amounts.some((_, key) => {
        if (handleValidation(_, key) !== ValidationError.NO_ERR) return true;
      });
    }
  }, [amounts]);

  const shouldDisableCloseDialog = (event: Record<string, unknown>, reason: 'backdropClick' | 'escapeKeyDown') => {
    reason === 'backdropClick' && !isLoading && handleCloseDialog();
  };

  const USER_BALANCE_PRECISION = 7;

  return (
    <>
      <Dialog
        open={modal}
        onClose={(event, reason) => shouldDisableCloseDialog(event, reason)}
        className={cx('add-liquidity-modal')}
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        <Grid container alignItems="center" className={cx('header')}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Typography variant="h5" className={cx('header__title')}>
              Add liquidity
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
          <form id="form">
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
                    <div className={cx('item')}>
                      {pool.id.substr(0, 6) + '...' + pool.id.substr(pool.id.length - 4)}
                    </div>
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
                        <th>Asset</th>
                        <th>Wallet balance</th>
                        <th>Deposit amount</th>
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

                                {isBscConnected() &&
                                  key === singleAssetValue &&
                                  walletStatus.state === WalletState.CanChangeLiquidity &&
                                  !tokenApproved[token.address] && (
                                    <CButton
                                      size="xs"
                                      type="secondary"
                                      content="Unlock"
                                      isLoading={tokenApprovedLoading[token.address]}
                                      onClick={() => approveToken(token.address)}
                                    />
                                  )}
                              </div>
                            </td>
                            <td>
                              <Box display="inline-flex" alignItems="center">
                                <span>
                                  {wallet.bsc != '' &&
                                    formatBalance(
                                      userBalance[key],
                                      tokenDecimals(token.address),
                                      USER_BALANCE_PRECISION,
                                    )}
                                </span>
                                <button className={cx('max-btn')} type="button" onClick={() => handleMax(key)}>
                                  Max
                                </button>
                              </Box>
                            </td>
                            <td>
                              {key === singleAssetValue && (
                                <InputBase
                                  value={amounts[key]}
                                  type="number"
                                  onChange={handleChange(key)}
                                  onKeyPress={disableInvalidCharacters}
                                  onWheel={disableNumberInputScroll}
                                  placeholder="0.0"
                                />
                              )}
                              {key === singleAssetValue && isMaxExceeded(key) && (
                                <div className={cx('error')}>
                                  Max{' '}
                                  {formatBalance(
                                    userBalance[key],
                                    tokenDecimals(token.address),
                                    USER_BALANCE_PRECISION,
                                  )}
                                </div>
                              )}
                              {key === singleAssetValue && validationError === ValidationError.RATIO && (
                                <div className={cx('error')}>Amount can not exceed 1/2 of the current pool balance</div>
                              )}
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
                      <th>Asset</th>
                      <th>Wallet balance</th>
                      <th>Deposit amount</th>
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

                              {isBscConnected() &&
                                walletStatus.state === WalletState.CanChangeLiquidity &&
                                !tokenApproved[token.address] && (
                                  <CButton
                                    size="xs"
                                    type="secondary"
                                    content="Unlock"
                                    isLoading={tokenApprovedLoading[token.address]}
                                    onClick={() => approveToken(token.address)}
                                  />
                                )}
                            </div>
                          </td>
                          <td>
                            <Box display="flex" alignItems="center">
                              {wallet.bsc != '' &&
                                formatBalance(userBalance[key], tokenDecimals(token.address), USER_BALANCE_PRECISION)}
                              <button className={cx('max-btn')} type="button" onClick={() => handleMax(key)}>
                                Max
                              </button>
                            </Box>
                          </td>
                          <td>
                            <InputBase
                              value={amounts[key]}
                              type="number"
                              onChange={handleChange(key)}
                              onKeyPress={disableInvalidCharacters}
                              onWheel={disableNumberInputScroll}
                              placeholder="0.0"
                            />
                            {isMaxExceeded(key) && (
                              <div className={cx('error')}>
                                Max{' '}
                                {formatBalance(userBalance[key], tokenDecimals(token.address), USER_BALANCE_PRECISION)}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className={cx('content__amount')}>
              <span className={cx('content__amount__label')}>{pool.symbol} Amount</span>
              {formatPoolNumber(normalizeBalance(new BigNumber(poolTokens), FPT_DECIMALS).toString(), 10)}
              <span className={cx('content__amount__unit')}>{pool.symbol}</span>
            </div>
            {validationError === ValidationError.EXCEED_BALANCE && (
              <div className={cx('content__red-warning')}>
                <RedWarningIcon />
                <div>Input amounts exceed balance</div>
              </div>
            )}
            {validationError === ValidationError.EMPTY_AMOUNTS && (
              <div className={cx('content__red-warning')}>
                <RedWarningIcon />
                <div>{`Amount can't be empty`}</div>
              </div>
            )}
          </form>
        </Box>
        <div className={cx('footer')}>
          {!isBscConnected() && (
            <CButton
              content="Connect wallet"
              type="primary"
              size="md"
              fullWidth={true}
              onClick={handleOpenConnectDialog}
            />
          )}
          {isBscConnected() && walletStatus.state === WalletState.NeedProxy && (
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
          {isBscConnected() && walletStatus.state === WalletState.CanChangeLiquidity && (
            <CButton
              content="Add"
              onClick={() => {
                if (!isWhitelisted) {
                  setWarningMessage(
                    'Sorry, you can not add liquidity to this pool because it limit liquidity providers',
                  );
                  setOpenWarningPopup(!openWarningPopup);
                  return;
                }

                if (normalizeBalance(new BigNumber(poolCap), FPT_DECIMALS).lte(new BigNumber(pool.totalShares))) {
                  setWarningMessage('Sorry, the pool has reached its max cap.');
                  setOpenWarningPopup(!openWarningPopup);
                  return;
                } else if (
                  denormalizeBalance(new BigNumber(pool.totalShares), FPT_DECIMALS)
                    .plus(new BigNumber(poolTokens))
                    .gt(new BigNumber(poolCap))
                ) {
                  const remainingAmount = normalizeBalance(new BigNumber(poolCap), FPT_DECIMALS).minus(
                    new BigNumber(pool.totalShares),
                  );
                  setWarningMessage(
                    `The pool can only issue ${remainingAmount.toFixed(4)} more ${
                      pool.symbol
                    } before reaching its max cap. Please add less liquidity`,
                  );
                  setOpenWarningPopup(!openWarningPopup);
                  return;
                }
                handleSubmit();
              }}
              type="primary"
              size="md"
              fullWidth={true}
              isDisabled={validationError !== ValidationError.NO_ERR}
              isLoading={isLoading}
            />
          )}
        </div>
      </Dialog>

      <WarningPopup
        message={warningMessae}
        open={openWarningPopup}
        handleClose={() => {
          setOpenWarningPopup(!openWarningPopup);
        }}
      />
    </>
  );
};
