import { ButtonBase, Divider, Grid, IconButton, InputBase, Tooltip } from '@material-ui/core';
import { HelpOutline, ImportExportRounded } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useRef, useState } from 'react';
import BscSVG from 'src/assets/icon/BscSVG';
import LoadingSVG from 'src/assets/icon/LoadingSVG';
import StellarSVG from 'src/assets/icon/StellarSVG';
import CLoading from 'src/components/Loading';
import { BToken } from 'src/constants/abi/BToken';
import eventBus from 'src/event/event-bus';
import ConfidenceInterval from 'src/features/ConfidenceInterval';
import { getCurrentChainId, isConnected, isCorrectNetworkBsc } from 'src/features/ConnectWallet/helpers/connectWallet';
import { getBscAddress, getStellarAddress } from 'src/features/ConnectWallet/helpers/getAddress';
import { setOpenConnectDialog, setOpenWrongNetworkWarning } from 'src/features/ConnectWallet/redux/wallet';
import { ORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { refreshOpenOrder } from 'src/features/MyTransactions/MyTransactions.slice';
import SORTypeSelect from 'src/features/OrderForm/components/SORType';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import {
  BSCError,
  FreighterErrorMessage,
  MetaMaskErrorMessage,
  StellarOperationErrorCode,
  StellarTransactionErrorCode,
} from 'src/features/OrderForm/constants/error';
import { Message } from 'src/features/OrderForm/constants/message';
import { STELLAR_DECIMAL } from 'src/features/OrderForm/constants/order';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { TradingNetwork } from 'src/features/OrderForm/constants/tradingNetwork';
import { handleApproveAll, isApprovedAll } from 'src/features/OrderForm/helpers/approve/approve';
import { isFullyMatch } from 'src/features/OrderForm/helpers/createNewOrderFormat/createStellarOfferType2';
import {
  isConnectedWalletWithSuitableNetwork,
  isContainBsc,
  isContainBscOB,
  isContainStellarOB,
  isSingleBscLP,
  isSOR,
  isSORCombined2Network,
} from 'src/features/OrderForm/helpers/network/checkNetwork';
import { getAsset } from 'src/features/OrderForm/helpers/sendStellarOffer';
import { openErrorSnackbar } from 'src/features/OrderForm/helpers/snackbar';
import { submitBscMarketOrder, submitStellarMarketOffer } from 'src/features/OrderForm/helpers/submit';
import {
  setIsCanceling,
  setOpenCancelStellarOrder,
  setOpenWrongFreighterAccountWarning,
  setOrderId,
  setStellarOfferId,
} from 'src/features/OrderForm/redux/orderForm';
import { getFee } from 'src/features/OrderForm/services';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { formatPoolPercent, setDataPrecision } from 'src/features/PoolsInfo/helpers/dataFormatter';
import SlippageTolerance from 'src/features/SlippageTolerance';
import {
  setCustomSlippageTolerance,
  setSlippageTolerance,
} from 'src/features/SlippageTolerance/redux/slippageTolerance';
import { Source } from 'src/features/SOR/constances/source';
import { getIncludedSourcesFromSelectedMethod } from 'src/features/SOR/helpers/getIncludedSources';
import { getNeededAmount } from 'src/features/SOR/helpers/getNeededAmount';
import { getRole } from 'src/features/SOR/helpers/getRole';
import { clearSorData, getSORdata, setIsLoadingSORData } from 'src/features/SOR/redux/sor';
import { isValidPancakeSwap } from 'src/features/SwapForm/helpers/pancake';
import styles from 'src/features/SwapForm/styles/SwapForm.module.scss';
import { getWalletStellar } from 'src/features/User/Account/Dashboard/OverView/helper';
import ViewOrderRouting from 'src/features/ViewOrderRouting/components/ViewOrderRouting';
import { getAvailableBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import { sleep } from 'src/helpers/share';
import { warpFromBscToStellar, warpFromStellarToBsc, WarpStatus } from 'src/helpers/warp/warp';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import Web3 from 'web3';
import {
  disableInvalidCharacters,
  disableNumberInputScroll,
  disableNumberInputUpDown,
} from '../helpers/disableInvalidNumberInput';
import { getAmountPrecision, getDecimal, getPattern, getPricePrecision } from '../helpers/getPairAttributes';
import { swap } from '../helpers/swapProxy';
import SwapConfirm from './SwapConfirm';

const cx = classnames.bind(styles);

interface IObject {
  [key: string]: any;
}

const ZERO_VALUE = '0';
const ERR_MESS_SMALLER_1 = 'Amount can not be smaller than 1';
const ERR_MESS_SMALLER_0_01 = 'Amount can not be smaller than 0.01';
const ERR_BALANCE = 'Sorry, order amount is too small to execute.';

const SwapForm: React.FC = () => {
  const [amountFrom, setAmountFrom] = useState<string>('');
  const [amountTo, setAmountTo] = useState<string>('');
  const [buyToken, setBuyToken] = useState<string>('');
  const [sellToken, setSellToken] = useState<string>('');
  const [ratio, setRatio] = useState<string>(ZERO_VALUE);
  const [bscTradingMarketFee, setBscTradingMarketFee] = useState<string>(ZERO_VALUE);
  const [bscTradingLimitFee, setBscTradingLimitFee] = useState<string>(ZERO_VALUE);
  const [stellarTradingMarketFee, setStellarTradingMarketFee] = useState<string>(ZERO_VALUE);
  const [stellarTradingLimitFee, setStellarTradingLimitFee] = useState<string>(ZERO_VALUE);
  const [balanceBsc, setBalanceBsc] = useState<string>(ZERO_VALUE);
  const [balanceStellar, setBalanceStellar] = useState<string>(ZERO_VALUE);
  const [inputTo, setInputTo] = useState<boolean>(false);
  const [isSwitched, setIsSwitched] = useState<boolean>(false);
  const [isTransactionLoading, setIsTransactionLoading] = useState<boolean>(false);
  // const [loadingFetchBalances, setLoadingFetchBalances] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [warning, setWarning] = useState<string>('');
  const [warningAmountTo, setWarningAmountTo] = useState<string>('');
  const [slippageWarning, setSlippageWarning] = useState<string>('');
  const [isOnTheSameNetwork, setIsOnTheSameNetwork] = useState<boolean>(false);
  const [exchangeValue, setExchangeValue] = useState<string>('');
  const [sorData, setSorData] = useState<IObject>({});
  const [contentButtonWallet, setContentButtonWallet] = useState<string>('Connect wallet');
  const [disableSwitchButton, setDisableSwitchButton] = useState<boolean>(false);
  const [openUnlockDigitalCredit, setOpenUnlockDigitalCredit] = useState<boolean>(false);
  const [loadingUnlock, setLoadingUnlock] = useState<boolean>(false);
  const [paramsSubmitSor, setParamsSubmitSor] = useState({});
  const amountInput = useRef<string>('');

  const sorType = useAppSelector((state) => state.orderForm.sorType);
  const pricePerUnitRef = useRef<string>('0');
  // const paramsAmountFromRef = useRef<any>();
  const dispatch = useAppDispatch();
  const sor = useAppSelector((state) => state.sor);
  const wallet = useAppSelector((state) => state.wallet);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const isSORLoading = useAppSelector((state) => state.sor.isLoadingSORData);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const slippageTolerance = useAppSelector((state) => state.slippage.slippageTolerance);
  const customSlippageTolerance = useAppSelector((state) => state.slippage.customSlippageTolerance);
  const stellarWallet = useAppSelector(getWalletStellar);
  const isRefreshOpenOrder = useAppSelector((state) => state.myTransaction.refreshOrder);

  const setToken = async (pair: Pair) => {
    setSellToken(pair.base_bsc_address);
    setBuyToken(pair.quote_bsc_address);
  };

  const getBehaviour = () => {
    return isSwitched ? Behaviour.BUY : Behaviour.SELL;
  };

  const getExchangeValue = () => {
    if (!ratio) {
      return '';
    }
    const precision = getPricePrecision(selectedPair);
    const [baseSymbol, quoteSymbol, calculatedRatio] = isSwitched
      ? [selectedPair?.quote_symbol, selectedPair?.base_symbol, ratio]
      : [selectedPair?.base_symbol, selectedPair?.quote_symbol, ratio];

    // set price per unit render swap confirmation
    pricePerUnitRef.current = `${setDataPrecision(calculatedRatio, precision)} ${quoteSymbol}`;

    if (!calculatedRatio) {
      return '';
    }
    if (new BigNumber(setDataPrecision(calculatedRatio, precision)).isNaN()) {
      return '';
    }
    return `1 ${baseSymbol} = ${setDataPrecision(calculatedRatio, precision)} ${quoteSymbol}`;
  };

  const currentSlipagTorance = customSlippageTolerance ? customSlippageTolerance : slippageTolerance;

  const fetchBalanceStellar = async (behaviour: Behaviour): Promise<string> => {
    try {
      if (stellarWallet && selectedPair) {
        const balance =
          behaviour === Behaviour.BUY
            ? await getAvailableBalanceInStellar(
                stellarWallet,
                selectedPair.quote_type,
                selectedPair.quote_symbol,
                selectedPair.quote_stellar_issuer,
              )
            : await getAvailableBalanceInStellar(
                stellarWallet,
                selectedPair.base_type,
                selectedPair.base_symbol,
                selectedPair.base_stellar_issuer,
              );
        return new BigNumber(balance || '0').times(new BigNumber(10).pow(STELLAR_DECIMAL)).toString();
      } else {
        return '0';
      }
    } catch (error) {
      return '0';
    }
  };

  const fetchBalanceBsc = async (behaviour: Behaviour): Promise<string> => {
    try {
      if (getBscAddress(wallet) && selectedPair) {
        const balance =
          behaviour === Behaviour.BUY
            ? await getBalanceInBsc(getBscAddress(wallet), selectedPair.quote_bsc_address, selectedPair.quote_decimal)
            : await getBalanceInBsc(getBscAddress(wallet), selectedPair.base_bsc_address, selectedPair.base_decimal);

        return new BigNumber(balance || '0').times(new BigNumber(10).pow(getDecimal(selectedPair, inputTo))).toString();
      } else {
        return '0';
      }
    } catch (error) {
      return '0';
    }
  };

  const exceededMaxBalance = () => {
    const totalBalance = new BigNumber(balanceBsc).plus(balanceStellar);
    if (!new BigNumber(amountFrom).gt(0)) {
      return false;
    }
    return new BigNumber(amountFrom).gt(totalBalance);
  };

  const getBalanceStellar = () => {
    return `${setDataPrecision(balanceStellar, 7)} ${isSwitched ? selectedPair?.quote_name : selectedPair?.base_name}`;
  };

  const getBalanceBsc = () => {
    return (
      // wallet.bsc &&
      `${setDataPrecision(balanceBsc, 7)} ${isSwitched ? selectedPair?.quote_name : selectedPair?.base_name}`
    );
  };

  const getBaseTokenBalance = async (token: string) => {
    if (window.web3 && token) {
      const web3 = new Web3(window.web3.currentProvider);
      // @ts-ignore
      const bTokenInstance = new web3.eth.Contract(BToken, token);
      const balance = await bTokenInstance.methods.balanceOf(wallet.bsc).call();
      setBalanceBsc(new BigNumber(balance).div(new BigNumber(10).pow(getDecimal(selectedPair, isSwitched))).toString());
    }
  };

  const getEffectiveExecutablePrice = () => (isSwitched ? amountFrom : amountTo) || 0;

  const handleApprove = async () => {
    try {
      setLoadingUnlock(true);
      await handleApproveAll(
        getBscAddress(wallet),
        isSwitched ? Behaviour.BUY : Behaviour.SELL,
        isSOR(selectedMethods) ? sorType : null,
        selectedPair,
      );

      await (async () => {
        setOpenUnlockDigitalCredit(
          !(await isApprovedAll(
            getBscAddress(wallet),
            isSwitched ? Behaviour.BUY : Behaviour.SELL,
            isSOR(selectedMethods) && (isContainStellarOB(selectedMethods) || isContainBscOB(selectedMethods))
              ? sorType
              : null,
            selectedPair,
          )) && isContainBsc(selectedMethods),
        );
      })();
    } catch (e) {
      // console.log(e);
    }

    setLoadingUnlock(false);
  };

  const clearData = () => {
    // setRatio(() => '');
    // setSorData(() => {});
    dispatch(clearSorData());
  };

  const getDataSOR = async (params: any) => {
    try {
      const role = await getRole(getBscAddress(wallet));
      if (amountInput.current) {
        const param = {
          value: undefined,
          buyToken: params.buyToken,
          sellToken: params.sellToken,
          amount: '',
          behaviour: params.behaviour,
          includedSources: getIncludedSourcesFromSelectedMethod(selectedMethods, role),
          slippagePercentage: new BigNumber(params.slippageTolerance).div(100).toString(),
          xlmFeeRate: params.xlmFeeRate,
          fcxFeeRate: params.fcxFeeRate,
          amountPrecision: params.amountPrecision,
          pricePrecision: params.pricePrecision,
          decimal: params.decimal,
          xlmSellTokenBalance: params.xlmSellTokenBalance,
          bscSellTokenBalance: params.bscSellTokenBalance,
          sorType: sorType,
          sellAmount: !inputTo
            ? new BigNumber(amountInput.current)
                .dp(params.amountPrecision, BigNumber.ROUND_DOWN)
                .times(new BigNumber(10).pow(params.decimal))
                .toString()
            : undefined,
          buyAmount: inputTo
            ? new BigNumber(amountInput.current)
                .dp(params.amountPrecision, BigNumber.ROUND_DOWN)
                .times(new BigNumber(10).pow(params.decimal))
                .toString()
            : undefined,
        };

        dispatch(getSORdata(param))
          .then(async (res: IObject) => {
            if (res.error) {
              if (
                res.payload?.data?.validationErrors?.find((x: IObject) => x.reason === 'INSUFFICIENT_ASSET_LIQUIDITY')
              ) {
                if (inputTo) {
                  setWarningAmountTo(`There's not enough liquidity to execute order`);
                } else {
                  setWarning(`There's not enough liquidity to execute order`);
                }
                return;
              }
            } else {
              if (inputTo) {
                setWarningAmountTo('');
              } else {
                setWarning('');
              }
            }

            const data = res.payload?.data;
            data.behaviour = inputTo ? Behaviour.BUY : Behaviour.SELL;
            if (!new BigNumber(data.price).dp(getPricePrecision(selectedPair)).gt(0)) {
              if (inputTo) {
                setWarningAmountTo(ERR_BALANCE);
              } else {
                setWarning(ERR_BALANCE);
              }
            }
            if (data && new BigNumber(data.price).dp(getPricePrecision(selectedPair)).gt(0)) {
              const pancakeSource = data.sources.find((source: { name: string }) => source.name === 'PancakeSwap_V2');
              setSorData(data);
              setRatio(new BigNumber(inputTo ? new BigNumber(1).div(data.price) : data.price).toString());
              params.setData(
                setDataPrecision(new BigNumber(amountInput.current).times(data.price), params.amountPrecision),
              );
              if (pancakeSource && pancakeSource.proportion == 1) {
                const sellAmount = data.sellAmount;
                const buyAmount = data.buyAmount;
                const guaranteedPrice = data.guaranteedPrice;
                const orders = data.orders;

                if (orders.length === 1) {
                  const isValidSlipage = await isValidPancakeSwap(
                    !inputTo ? sellAmount : new BigNumber(buyAmount).times(guaranteedPrice),
                    orders[0].fillData.tokenAddressPath,
                    !inputTo ? new BigNumber(sellAmount).times(guaranteedPrice) : buyAmount,
                  );
                  if (!isValidSlipage) {
                    setSlippageWarning(`Slippage tolerance is too small`);
                  } else {
                    setSlippageWarning(``);
                  }
                }
              }
            }
          })
          .finally(() => {
            dispatch(setIsLoadingSORData(false));
          });
      }
    } catch (e) {}
  };

  const timeoutAsset1 = useRef<any>(null);
  const timeoutAsset2 = useRef<any>(null);

  const handleChangeAmountFrom = (value: string) => {
    const to = false;
    setInputTo(to);
    if (timeoutAsset1.current) {
      clearTimeout(timeoutAsset1.current);
    }

    if (value === '' || value === undefined || value === null) {
      setAmountFrom('');
      setParamsSubmitSor(() => {});
      setWarning('');
      setWarningAmountTo('');
      setSlippageWarning('');
      setSlippageTolerance('');
      setRatio('');
      setAmountTo('');
      setSorData({});
      dispatch(clearSorData());
      amountInput.current = '';
      return;
    }

    const pattern = getPattern(selectedPair);
    if (!(pattern && pattern.test(value)) && new BigNumber(value).isNaN()) {
      return;
    } else {
      setParamsSubmitSor(() => {});
      setWarningAmountTo('');
      setSlippageTolerance('');
      setSlippageWarning('');
      setInputTo(to);
      // setInputTo(to);
      // setAmountFrom(value);

      if (pattern && pattern.test(value)) {
        setAmountFrom(value);
        amountInput.current = value;
      }

      timeoutAsset1.current = setTimeout(async () => {
        setAmountFrom(new BigNumber(value).dp(getAmountPrecision(selectedPair), BigNumber.ROUND_DOWN).toString());
        // if (value == '') {
        //   clearData();
        //   setRatio('');
        //   setAmountFrom(() => '');
        //   setAmountTo(() => '');
        //   // paramsAmountFromRef.current = {};
        //   setParamsSubmitSor(() => {});
        //   return;
        // } else if (parseFloat(value) < 1 && parseFloat(value) >= 0) {
        //   setAmountFrom(new BigNumber(value).dp(getAmountPrecision(selectedPair)).toString());
        //   setWarning(ERR_MESS_SMALLER_1);
        //   return;
        // } else {
        //   const pattern = getPattern(selectedPair);
        //   if (pattern && pattern.test(value)) {
        //     if (parseFloat(value) < 1 && parseFloat(value) >= 0) {
        //       value = '1';
        //       amountInput.current = '1';
        //     }
        //     setAmountFrom(new BigNumber(value).dp(getAmountPrecision(selectedPair)).toString());
        //   } else {
        //     if (!new BigNumber(amountFrom).isNaN()) {
        //       setAmountFrom(new BigNumber(amountFrom).dp(getAmountPrecision(selectedPair)).toString());
        //     } else {
        //       setAmountFrom(amountFrom);
        //     }
        //   }
        // }

        setRatio('');
        setAmountTo('');
        setSorData({});
        dispatch(clearSorData());

        if (value && selectedPair) {
          const decimal = getDecimal(selectedPair, inputTo);

          const params = {
            value: undefined,
            pricePrecision: getPricePrecision(selectedPair),
            amountPrecision: getAmountPrecision(selectedPair),
            decimal: decimal,
            setData: setAmountTo,
            behaviour: inputTo !== isSwitched ? Behaviour.BUY : Behaviour.SELL,
            slippageTolerance: currentSlipagTorance,
            buyToken: !isSwitched ? buyToken : sellToken,
            sellToken: !isSwitched ? sellToken : buyToken,
            xlmFeeRate: stellarTradingMarketFee,
            fcxFeeRate: bscTradingMarketFee,
            xlmSellTokenBalance: await fetchBalanceStellar(to !== isSwitched ? Behaviour.BUY : Behaviour.SELL),
            bscSellTokenBalance: await fetchBalanceBsc(to !== isSwitched ? Behaviour.BUY : Behaviour.SELL),
            sorType,
          };
          setParamsSubmitSor(() => params);
        }
      }, 1000);
    }
  };

  const handleChangeAmountTo = (value: string) => {
    const to = true;
    setInputTo(to);
    if (timeoutAsset2.current) {
      clearTimeout(timeoutAsset2.current);
    }

    if (value === '' || value === undefined || value === null) {
      setAmountTo('');
      setParamsSubmitSor(() => {});
      setWarning('');
      setWarningAmountTo('');
      setSlippageWarning('');
      setSlippageTolerance('');
      setRatio('');
      setAmountFrom('');
      setSorData({});
      dispatch(clearSorData());
      amountInput.current = '';
      return;
    }

    const pattern = getPattern(selectedPair);
    if (!(pattern && pattern.test(value)) && new BigNumber(value).isNaN()) {
      return;
    } else {
      setParamsSubmitSor(() => {});
      setWarning('');
      // setAmountTo(value);

      if (pattern && pattern.test(value)) {
        setAmountTo(value);
        amountInput.current = value;
      }

      if (new BigNumber(value).gte(0) && new BigNumber(value).lt(1)) {
        setWarningAmountTo(ERR_MESS_SMALLER_1);
      }

      timeoutAsset2.current = setTimeout(async () => {
        setAmountTo(new BigNumber(value).dp(getAmountPrecision(selectedPair), BigNumber.ROUND_DOWN).toString());
        // if (value == '') {
        //   clearData();
        //   setRatio('');
        //   setAmountFrom(() => '');
        //   setAmountTo(() => '');
        //   setParamsSubmitSor(() => {});
        //   return;
        // } else if (parseFloat(value) < 1 && parseFloat(value) >= 0) {
        //   setAmountTo(new BigNumber(value).dp(getAmountPrecision(selectedPair)).toString());
        //   setWarningAmountTo(ERR_MESS_SMALLER_1);
        //   return;
        // } else {
        //   setWarningAmountTo(() => '');
        //   if (pattern && pattern.test(value)) {
        //     if (parseFloat(value) < 1 && parseFloat(value) >= 0) {
        //       value = '1';
        //       amountInput.current = '1';
        //     }
        //     setAmountTo(new BigNumber(value).dp(getAmountPrecision(selectedPair)).toString());
        //   } else {
        //     if (!new BigNumber(amountTo).isNaN()) {
        //       setAmountTo(new BigNumber(amountTo).dp(getAmountPrecision(selectedPair)).toString());
        //     } else {
        //       setAmountTo(amountTo);
        //     }
        //   }
        // }

        setRatio('');
        setAmountFrom('');
        setSorData({});
        dispatch(clearSorData());
        if (value && selectedPair) {
          const decimal = getDecimal(selectedPair, inputTo);

          const params = {
            value: undefined,
            pricePrecision: getPricePrecision(selectedPair),
            amountPrecision: getAmountPrecision(selectedPair),
            decimal: decimal,
            setData: setAmountFrom,
            behaviour: inputTo !== isSwitched ? Behaviour.BUY : Behaviour.SELL,
            slippageTolerance: currentSlipagTorance,
            buyToken: !isSwitched ? buyToken : sellToken,
            sellToken: !isSwitched ? sellToken : buyToken,
            xlmFeeRate: stellarTradingMarketFee,
            fcxFeeRate: bscTradingMarketFee,
            xlmSellTokenBalance: await fetchBalanceStellar(to !== isSwitched ? Behaviour.SELL : Behaviour.BUY),
            bscSellTokenBalance: await fetchBalanceBsc(to !== isSwitched ? Behaviour.SELL : Behaviour.BUY),
            sorType,
          };
          setParamsSubmitSor(() => params);
          dispatch(setIsLoadingSORData(true));
          await getDataSOR(params);
          dispatch(setIsLoadingSORData(false));
        }
      }, 1000);
    }
  };

  const switchTokens = () => {
    setDisableSwitchButton(true);
    clearData();
    // setBalanceBsc(ZERO_VALUE);
    setWarning('');
    setWarningAmountTo('');
    setSlippageWarning('');
    setSlippageTolerance('');
    setInputTo(!inputTo);
    setIsSwitched(!isSwitched);
    setTimeout(() => {
      setDisableSwitchButton(false);
    }, 3000);
  };

  const fetchFee = async () => {
    setBscTradingMarketFee(await getFee(TradingNetwork.BSC, ORDER_TYPE.MARKET));
    setBscTradingLimitFee(await getFee(TradingNetwork.BSC, ORDER_TYPE.LIMIT));
    setStellarTradingMarketFee(await getFee(TradingNetwork.STELLAR, ORDER_TYPE.MARKET));
    setStellarTradingLimitFee(await getFee(TradingNetwork.STELLAR, ORDER_TYPE.LIMIT));
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  // wrong network warning dialog
  // const handleOpenWrongNetworkWaringDialog = () => {
  //   dispatch(setOpenWrongNetworkWarning2(true));
  // };

  const handleOpenCancelStellarOrderDialog = () => {
    dispatch(setIsCanceling(false));
    dispatch(setOpenCancelStellarOrder(true));
  };

  // wrong freighter account warning
  const handleOpenWrongFreighterAccountWarning = () => {
    dispatch(setOpenWrongFreighterAccountWarning(true));
  };

  const isSwapDisabled = () => {
    const needBalanceBsc = isContainBsc(selectedMethods);
    const needBalanceStellar = isContainStellarOB(selectedMethods);
    const connectedBsc = !!getBscAddress(wallet);
    const connectedStellar = !!getStellarAddress(wallet);

    const haveBalanceBscInNeed =
      needBalanceBsc && sorType === SORType.USER_SOR ? new BigNumber(balanceBsc).gte(0) && connectedBsc : true;
    const haveBalanceStellarInNeed =
      needBalanceStellar && sorType === SORType.USER_SOR
        ? new BigNumber(balanceStellar).gte(0) && connectedStellar
        : true;

    return (
      isTransactionLoading ||
      // loadingFetchBalances ||
      loadingUnlock ||
      isSORLoading ||
      !Number(ratio) ||
      !isOnTheSameNetwork ||
      exceededMaxBalance() ||
      !haveBalanceBscInNeed ||
      !haveBalanceStellarInNeed ||
      !!warning ||
      !!warningAmountTo ||
      !!slippageWarning
    );
  };

  const submitText = () => {
    return isContainBscOB(selectedMethods) || isContainStellarOB(selectedMethods) ? 'Trade' : 'Swap';
  };

  // Effect change amount

  useEffect(() => {
    setAmountFrom(() => '');
    setAmountTo(() => '');
    amountInput.current = '';
    clearData();
  }, [selectedMethods.length, selectedPair?.pairs_id]);

  useEffect(() => {
    if (isSORLoading) {
      inputTo ? setAmountFrom('') : setAmountTo('');
    }
  }, [isSORLoading]);

  useEffect(() => {
    // set value when switch
    if (inputTo) {
      setAmountFrom('');
      // setAmountTo(amountInput.current);
      setAmountTo(
        new BigNumber(amountInput.current).dp(getAmountPrecision(selectedPair), BigNumber.ROUND_DOWN).toString(),
      );
    }
    if (!inputTo) {
      setAmountTo('');
      // setAmountFrom(amountInput.current);
      setAmountFrom(
        new BigNumber(amountInput.current).dp(getAmountPrecision(selectedPair), BigNumber.ROUND_DOWN).toString(),
      );
    }
  }, [inputTo]);

  // useEffect(() => {
  //   if (isSingleBscLP(selectedMethods) || isBscOBLP(selectedMethods)) {
  //     setLoadingFetchBalances(true);
  //     setTimeout(() => {
  //       setLoadingFetchBalances(false);
  //     }, 1000);
  //   }
  // }, [isSwitched, selectedMethods.length, stellarWallet, wallet.bsc]);

  useEffect(() => {
    setExchangeValue(getExchangeValue());
  }, [isSORLoading, ratio, warning]);

  useEffect(() => {
    if (!!warning && amountFrom) {
      setWarning(() => '');
    }
    clearTimeout(timeoutAsset1.current);
    clearTimeout(timeoutAsset2.current);
  }, [isSwitched]);

  // get data sor
  useEffect(() => {
    setParamsSubmitSor(() => ({
      ...paramsSubmitSor,
      buyToken: !isSwitched ? buyToken : sellToken,
      sellToken: !isSwitched ? sellToken : buyToken,
      sorType,
      behaviour: isSwitched || inputTo ? Behaviour.BUY : Behaviour.SELL,
      setData: inputTo ? setAmountFrom : setAmountTo,
      slippageTolerance: currentSlipagTorance,
    }));
  }, [sorType, stellarWallet, wallet.bsc, currentSlipagTorance, isSwitched]);

  useEffect(() => {
    if (!warning) {
      dispatch(setIsLoadingSORData(true));
      getDataSOR(paramsSubmitSor).then();
      dispatch(setIsLoadingSORData(false));
    }
  }, [paramsSubmitSor]);

  useEffect(() => {
    if (!amountFrom) {
      clearData();
      pricePerUnitRef.current = '';
    }
  }, [amountFrom]);

  useEffect(() => {
    if (!amountTo) {
      setWarningAmountTo('');
      setSlippageTolerance('');
      setSlippageWarning('');
    }
  }, [amountTo]);

  useEffect(() => {
    clearData();
    setExchangeValue('');
    setAmountFrom(() => '');
    setAmountTo(() => '');
    setParamsSubmitSor(() => {});
    setRatio('');
  }, [selectedMethods.length, selectedPair?.pairs_id]);

  // update balance bsc
  let intervalOfBalanceBsc: NodeJS.Timeout;
  useEffect(() => {
    clearData();
    fetchFee();
    setSorData({});

    clearInterval(intervalOfBalanceBsc);
    if (selectedPair != undefined) {
      const network = isCorrectNetworkBsc(getCurrentChainId());
      setIsOnTheSameNetwork(network);

      setToken(selectedPair);
      if (isConnected(wallet) && wallet.bsc) {
        getBaseTokenBalance(isSwitched ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address);
      }
    }
    intervalOfBalanceBsc = setInterval(() => {
      if (selectedPair != undefined) {
        const network = isCorrectNetworkBsc(getCurrentChainId());
        setIsOnTheSameNetwork(network);

        setToken(selectedPair);
        if (isConnected(wallet) && wallet.bsc) {
          getBaseTokenBalance(isSwitched ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address);
        }
      }
    }, 5000);
    return () => {
      clearInterval(intervalOfBalanceBsc);
    };
  }, [selectedPair, wallet.bsc, isSwitched]);

  useEffect(() => {
    eventBus.on(SocketEvent.TradingFeeUpdated, async (): Promise<void> => {
      await sleep(1000);
      fetchFee();
    });
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        const network = isCorrectNetworkBsc(getCurrentChainId());
        setIsOnTheSameNetwork(network);
      });
    }
  }, []);

  useEffect(() => {
    const maxBalance = new BigNumber(balanceBsc)
      .plus(balanceStellar || 0)
      .toFixed(7)
      .toString();
    setWarning(() => (exceededMaxBalance() ? `Max amount: ${maxBalance}` : ''));
  }, [amountFrom, amountTo, balanceBsc, balanceStellar, sorType]);

  // update balance stellar
  let intervalOfBalanceStellar: NodeJS.Timeout;
  useEffect(() => {
    clearData();

    clearInterval(intervalOfBalanceStellar);
    if (isContainStellarOB(selectedMethods)) {
      // setLoadingFetchBalances(true);
      fetchBalanceStellar(isSwitched ? Behaviour.BUY : Behaviour.SELL).then((balance) => {
        setBalanceStellar(new BigNumber(balance).div(new BigNumber(10).pow(STELLAR_DECIMAL)).toString());
        // setLoadingFetchBalances(false);
      });
      intervalOfBalanceStellar = setInterval(() => {
        // setLoadingFetchBalances(true);
        fetchBalanceStellar(isSwitched ? Behaviour.BUY : Behaviour.SELL).then((balance) => {
          setBalanceStellar(new BigNumber(balance).div(new BigNumber(10).pow(STELLAR_DECIMAL)).toString());
          // setLoadingFetchBalances(false);
        });
      }, 5000);
    }
    return () => {
      clearInterval(intervalOfBalanceStellar);
    };
  }, [selectedPair, selectedMethods, isSwitched, wallet]);

  useEffect(() => {
    (async () => {
      setIsTransactionLoading(true);
      const sorType = isSOR(selectedMethods) ? SORType.MARKET_SOR : null;

      await isApprovedAll(wallet.bsc, getBehaviour(), sorType, selectedPair);
      // setToBeApproved(!approvalStatus);
      setIsTransactionLoading(false);
    })();
  }, [wallet, isSwitched, selectedMethods, selectedPair]);

  useEffect(() => {
    setIsSwitched(false);
  }, [selectedPair?.pairs_id]);

  // check generated data
  useEffect(() => {
    if (new BigNumber(amountFrom).gte(0) && new BigNumber(amountFrom).lt(1) && !inputTo) {
      setWarning(ERR_MESS_SMALLER_1);
    }
    if (new BigNumber(amountTo).gte(0) && new BigNumber(amountTo).lt(1) && inputTo) {
      setWarningAmountTo(ERR_MESS_SMALLER_1);
    }

    if (new BigNumber(amountFrom).dp(getAmountPrecision(selectedPair), BigNumber.ROUND_DOWN).lte(0) && inputTo) {
      setWarning(ERR_MESS_SMALLER_0_01);
    }
    if (new BigNumber(amountTo).dp(getAmountPrecision(selectedPair), BigNumber.ROUND_DOWN).lte(0) && !inputTo) {
      setWarningAmountTo(ERR_MESS_SMALLER_0_01);
    }
  }, [amountFrom, amountTo]);

  const handleSubmit = async () => {
    // const checkNetworkData = checkNetwork(wallet, selectedMethods);
    // // check network of wallet and trading method are on the same network
    // if (!checkNetworkData.isOnTheSameNetwork) {
    //   dispatch(setCheckNetworkData(checkNetworkData));
    //   handleOpenWrongNetworkWaringDialog();
    //   setIsTransactionLoading(false);
    //   setShowConfirm(false);
    // } else {
    try {
      if (selectedPair && amountFrom != null) {
        setIsTransactionLoading(true);

        const data = sorData;
        const price = isSwitched ? new BigNumber(1).div(new BigNumber(data.price)) : data.price;
        const bscOrdersArr: IObject = [];
        const stellarOrdersArr: IObject = [];
        const poolOrdersArr: IObject = [];

        // push orders into respective arrays
        data.orders.forEach((order: IObject) => {
          if (order.source == Source.StellarOBSource) {
            stellarOrdersArr.push(order);
          }
          if (order.source == Source.BscOBSource) {
            bscOrdersArr.push(order);
          }
          if (
            order.source == Source.BscLPSourceAdmin ||
            order.source == Source.BscLPSourceRestricted ||
            order.source == Source.BscLPSourceUnrestricted ||
            order.source === Source.BscLPSource ||
            order.source === Source.PancakeswapLPSource
          ) {
            poolOrdersArr.push(order);
          }
        });

        // bsc order buy amount
        const [bscOrderMakerAmount, bscOrderTakerAmount] = bscOrdersArr.reduce(
          (amount: Array<string>, order: IObject) => {
            return [
              new BigNumber(amount[0]).plus(order.makerAmount).toString(),
              new BigNumber(amount[1]).plus(order.takerAmount).toString(),
            ];
          },
          [0, 0],
        );

        // bsc order sell amount
        const [stellarOrderMakerAmount, stellarOrderTakerAmount] = stellarOrdersArr.reduce(
          (amount: Array<string>, order: IObject) => {
            return [
              new BigNumber(amount[0]).plus(order.makerAmount).toString(),
              new BigNumber(amount[1]).plus(order.takerAmount).toString(),
            ];
          },
          [0, 0],
        );

        const amountPrecision = getAmountPrecision(selectedPair);
        const decimal = getDecimal(selectedPair, inputTo);
        const bscAmount = new BigNumber(getBehaviour() == Behaviour.BUY ? bscOrderMakerAmount : bscOrderTakerAmount)
          .div(new BigNumber(10).pow(decimal))
          .dp(amountPrecision)
          .toString();
        const stellarAmount = new BigNumber(
          getBehaviour() == Behaviour.BUY ? stellarOrderMakerAmount : stellarOrderTakerAmount,
        )
          .div(new BigNumber(10).pow(decimal))
          .dp(amountPrecision)
          .toString();

        // calculate pool order
        if (new BigNumber(data.buyAmount).gt(bscOrderMakerAmount)) {
          data.buyAmount = new BigNumber(data.buyAmount).minus(bscOrderMakerAmount).toString();
        }
        if (new BigNumber(data.buyAmount).gt(stellarOrderMakerAmount)) {
          data.buyAmount = new BigNumber(data.buyAmount).minus(stellarOrderMakerAmount).toString();
        }

        if (new BigNumber(data.sellAmount).gt(bscOrderTakerAmount)) {
          data.sellAmount = new BigNumber(data.sellAmount).minus(bscOrderTakerAmount).toString();
        }

        if (new BigNumber(data.sellAmount).gt(stellarOrderTakerAmount)) {
          data.sellAmount = new BigNumber(data.sellAmount).minus(stellarOrderTakerAmount).toString();
        }

        // run warp
        if (isSORCombined2Network(selectedMethods)) {
          // get needed amount for warping
          const neededAmount = getNeededAmount(balanceStellar, balanceBsc, sor, getBehaviour(), price);

          if (new BigNumber(neededAmount.bsc).gt(0) && sorType === SORType.MARKET_SOR) {
            const currentAssets = getAsset(
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_symbol : selectedPair.base_symbol,
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_stellar_issuer : selectedPair.base_stellar_issuer,
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_type : selectedPair.base_type,
            );

            // Warp stellar to bsc
            await warpFromStellarToBsc(
              getStellarAddress(wallet),
              getBscAddress(wallet),
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_warp_type_id : selectedPair.base_warp_type_id,
              neededAmount.bsc,
              currentAssets,
              wallet,
            );
          } else if (new BigNumber(neededAmount.stellar).gt(0) && sorType === SORType.MARKET_SOR) {
            // Warp bsc to stellar
            await warpFromBscToStellar(
              getBscAddress(wallet),
              getStellarAddress(wallet),
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_warp_type_id : selectedPair.base_warp_type_id,
              neededAmount.stellar,
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address,
              getBehaviour() === Behaviour.BUY ? selectedPair.quote_decimal : selectedPair.base_decimal,
            );
          }
        }

        if (isContainBscOB(selectedMethods) && !isContainStellarOB(selectedMethods) && bscOrdersArr.length) {
          try {
            await submitBscMarketOrder({
              amountTotal: bscAmount,
              price: new BigNumber(price).toFixed(getPricePrecision(selectedPair) || 5),
              selectedPair,
              customSlippageTolerance,
              slippageTolerance,
              behaviour: getBehaviour(),
              bscTradingFee: bscTradingMarketFee,
              wallet,
              option: {
                label: 'Amount',
                value: 'Amount',
              },
            });
          } catch (e) {
            if (
              e === MetaMaskErrorMessage.DENIED_MESSAGE_SIGNATURE ||
              e === MetaMaskErrorMessage.DENIED_TRANSACTION_SIGNATURE
            ) {
              openErrorSnackbar(Message.ORDER_REJECTED);
            } else if (e === BSCError.WRONG_NETWORK) {
              dispatch(setOpenWrongNetworkWarning(true));
            } else {
              openErrorSnackbar(e?.toString() || 'error');
            }
          }
        } else if (isContainStellarOB(selectedMethods) && !isContainBscOB(selectedMethods) && stellarOrdersArr.length) {
          try {
            const res = await submitStellarMarketOffer({
              amountTotal: stellarAmount,
              price: new BigNumber(price).toFixed(getPricePrecision(selectedPair) || 5),
              selectedPair,
              customSlippageTolerance,
              slippageTolerance,
              behaviour: getBehaviour(),
              stellarTradingFee: stellarTradingMarketFee,
              wallet,
              option: {
                label: 'Amount',
                value: 'Amount',
              },
            });
            if (res.stellar && res.api) {
              dispatch(setStellarOfferId(res.api.data.stellar_id));
              dispatch(setOrderId(res.api.data.id));
              if (!(await isFullyMatch(res.stellar))) {
                handleOpenCancelStellarOrderDialog();
              }
            }
          } catch (e) {
            if (Array.isArray(e) && e.find((v: string) => v === StellarOperationErrorCode.OP_CROSS_SELF)) {
              openErrorSnackbar(Message.CANNOT_MATCH_PREVIOUS_ORDER);
            } else if (Array.isArray(e) && e.find((v: string) => v === StellarOperationErrorCode.OP_UNDERFUNDED)) {
              openErrorSnackbar(Message.NOT_ENOUGH_BALANCE);
            } else if (e === FreighterErrorMessage.USER_DECLINED_ACCESS) {
              openErrorSnackbar(Message.ORDER_REJECTED);
            } else if (e === StellarTransactionErrorCode.TX_BAD_AUTH) {
              if (wallet.freighter) {
                handleOpenWrongFreighterAccountWarning();
              } else {
                openErrorSnackbar(e);
              }
            } else if (e === StellarTransactionErrorCode.TX_TOO_LATE) {
              openErrorSnackbar(Message.TIME_LIMITED_EXCEEDED);
            } else {
              openErrorSnackbar(e?.toString() || 'error');
            }
          }
        } else if (isContainBscOB(selectedMethods) && isContainStellarOB(selectedMethods)) {
          if (bscOrdersArr.length) {
            try {
              // submit bsc order
              await submitBscMarketOrder({
                amountTotal: bscAmount,
                price: new BigNumber(price).toFixed(getPricePrecision(selectedPair) || 5),
                selectedPair,
                customSlippageTolerance,
                slippageTolerance,
                behaviour: getBehaviour(),
                bscTradingFee: bscTradingMarketFee,
                wallet,
                option: {
                  label: 'Amount',
                  value: 'Amount',
                },
              });
            } catch (e) {
              if (
                e === MetaMaskErrorMessage.DENIED_MESSAGE_SIGNATURE ||
                e === MetaMaskErrorMessage.DENIED_TRANSACTION_SIGNATURE
              ) {
                openErrorSnackbar(Message.ORDER_REJECTED);
              } else if (e === BSCError.WRONG_NETWORK) {
                dispatch(setOpenWrongNetworkWarning(true));
              } else {
                openErrorSnackbar(e?.toString() || 'error');
              }
            }
          }
          if (stellarOrdersArr.length) {
            // submit stellar order
            try {
              const res = await submitStellarMarketOffer({
                amountTotal: stellarAmount,
                price: new BigNumber(price).toFixed(getPricePrecision(selectedPair) || 5),
                selectedPair,
                customSlippageTolerance,
                slippageTolerance,
                behaviour: getBehaviour(),
                stellarTradingFee: stellarTradingMarketFee,
                wallet,
                option: {
                  label: 'Amount',
                  value: 'Amount',
                },
              });
              if (res.stellar && res.api) {
                dispatch(setStellarOfferId(res.api.data.stellar_id));
                dispatch(setOrderId(res.api.data.id));
                if (!(await isFullyMatch(res.stellar))) {
                  handleOpenCancelStellarOrderDialog();
                }
              }
            } catch (e) {
              if (Array.isArray(e) && e.find((v: string) => v === StellarOperationErrorCode.OP_CROSS_SELF)) {
                openErrorSnackbar(Message.CANNOT_MATCH_PREVIOUS_ORDER);
              } else if (Array.isArray(e) && e.find((v: string) => v === StellarOperationErrorCode.OP_UNDERFUNDED)) {
                openErrorSnackbar(Message.NOT_ENOUGH_BALANCE);
              } else if (e === FreighterErrorMessage.USER_DECLINED_ACCESS) {
                openErrorSnackbar(Message.ORDER_REJECTED);
              } else if (e === StellarTransactionErrorCode.TX_BAD_AUTH) {
                if (wallet.freighter) {
                  handleOpenWrongFreighterAccountWarning();
                } else {
                  openErrorSnackbar(e);
                }
              } else if (e === StellarTransactionErrorCode.TX_TOO_LATE) {
                openErrorSnackbar(Message.TIME_LIMITED_EXCEEDED);
              } else {
                openErrorSnackbar(e?.toString() || 'error');
              }
            }
          }
        }

        // liquidity pool swap
        if (poolOrdersArr.length) {
          delete data['gasPrice'];
          try {
            await swap(data, wallet.bsc);
          } catch (e) {
            if (
              e.message === MetaMaskErrorMessage.DENIED_MESSAGE_SIGNATURE ||
              e.message === MetaMaskErrorMessage.DENIED_TRANSACTION_SIGNATURE
            ) {
              openErrorSnackbar(Message.ORDER_REJECTED);
            } else {
              openErrorSnackbar(e?.toString() || 'error');
            }
          }
        }
      }
    } catch (e) {
      if (e.message === WarpStatus.FAILED) {
        dispatch(
          openSnackbar({
            message: Message.WARP_FAILED,
            variant: SnackbarVariant.ERROR,
          }),
        );
      } else {
        openErrorSnackbar(e?.message || e.toString());
      }
    } finally {
      clearData();
      // reset form
      setAmountFrom('');
      setAmountTo('');
      setRatio('');
      dispatch(setSlippageTolerance('90'));
      dispatch(setCustomSlippageTolerance(''));
      amountInput.current = '';
      setIsSwitched(false);
      await getBaseTokenBalance(!isSwitched ? sellToken : buyToken);
      setIsTransactionLoading(false);
      setShowConfirm(false);
      dispatch(refreshOpenOrder(!isRefreshOpenOrder));
    }
    // }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (openUnlockDigitalCredit) {
      handleApprove();
    } else {
      setShowConfirm(true);
    }
  };

  // check approve
  useEffect(() => {
    setWarning('');
    setWarningAmountTo('');
    setSlippageWarning('');
    setSlippageTolerance('');
    (async () => {
      setOpenUnlockDigitalCredit(
        !(await isApprovedAll(
          getBscAddress(wallet),
          isSwitched ? Behaviour.BUY : Behaviour.SELL,
          isSOR(selectedMethods) && (isContainStellarOB(selectedMethods) || isContainBscOB(selectedMethods))
            ? sorType
            : null,
          selectedPair,
        )) && isContainBsc(selectedMethods),
      );
    })();
  }, [wallet, isSwitched, selectedMethods, sorType, selectedPair]);

  useEffect(() => {
    // if (isStellarOBLP(selectedMethods) || isAllMethods(selectedMethods)) {
    //   if (!stellarWallet && !wallet.bsc) {
    //     setContentButtonWallet('Connect wallet');
    //     return;
    //   }
    //   if (!stellarWallet) {
    //     setContentButtonWallet('Connect Stellar wallet');
    //     return;
    //   }
    //   if (!wallet.bsc) {
    //     setContentButtonWallet('Connect BSC wallet');
    //     return;
    //   }
    // }
    // if (
    //   isSinglePancakeswapLP(selectedMethods) ||
    //   isSingleBscLP(selectedMethods) ||
    //   (isBscOBLP(selectedMethods) && !wallet.bsc)
    // ) {
    //   setContentButtonWallet('Connect BSC wallet');
    //   return;
    // }

    const res = isConnectedWalletWithSuitableNetwork(wallet, selectedMethods);
    if (res.isConnected) {
      setContentButtonWallet('');
    } else {
      setContentButtonWallet(res.buttonContent);
    }
  }, [selectedMethods, wallet.bsc, stellarWallet]);

  const getAmountWithSymbol = (type: 'from' | 'to') => {
    const fromSymbol = !isSwitched ? selectedPair?.base_symbol : selectedPair?.quote_symbol;
    const toSymbol = !isSwitched ? selectedPair?.quote_symbol : selectedPair?.base_symbol;
    return type == 'from' ? amountFrom + ' ' + fromSymbol : amountTo + ' ' + toSymbol;
  };
  return (
    <>
      <SwapConfirm
        modal={showConfirm}
        setModal={() => setShowConfirm(!showConfirm)}
        onSubmit={handleSubmit}
        slippage={currentSlipagTorance}
        amountFrom={getAmountWithSymbol('from')}
        amountTo={getAmountWithSymbol('to')}
        pricePerUnit={pricePerUnitRef.current}
        loading={isTransactionLoading}
        sorType={sorType}
      />
      <div className={cx('swap-form')}>
        {(isContainBscOB(selectedMethods) || isContainStellarOB(selectedMethods)) && (
          <div className={cx('dropdown')}>
            <SORTypeSelect />
          </div>
        )}
        <div className={cx('guide')}>
          <Tooltip
            arrow
            PopperProps={{
              className: 'tooltip-arrow-lg',
            }}
            placement="top"
            classes={{ tooltip: cx('wrapper') }}
            title={
              <div className={cx('tooltip')}>
                <div className={cx('tooltip__other')}>Trading fees for order book</div>
                <Grid container>
                  <Grid item xs={6}>
                    <div className={cx('tooltip__item')}>
                      <StellarSVG size="md" />
                      &nbsp;
                      <span>Market order: {formatPoolPercent(stellarTradingMarketFee, 2, '0')}%</span>
                    </div>
                    <div className={cx('tooltip__item')}>
                      <StellarSVG size="md" />
                      &nbsp;
                      <span>Limit order: {formatPoolPercent(stellarTradingLimitFee, 2, '0')}%</span>
                    </div>
                  </Grid>
                  <Grid item xs={6}>
                    <div className={cx('tooltip__item')}>
                      <BscSVG size="md" />
                      &nbsp;
                      <span>Market order: {formatPoolPercent(bscTradingMarketFee, 2, '0')}%</span>
                    </div>
                    <div className={cx('tooltip__item')}>
                      <BscSVG size="md" />
                      &nbsp;
                      <span>Limit order: {formatPoolPercent(bscTradingLimitFee, 2, '0')}%</span>
                    </div>
                  </Grid>
                </Grid>
                <div>Trading fees for liquidity pool are specific to each pool</div>
              </div>
            }
          >
            <div style={{ zIndex: 2 }}>
              <HelpOutline fontSize="inherit" className={cx('help')} />
            </div>
          </Tooltip>
          <div style={{ height: 16 }}>
            {/*{loadingFetchBalances ? (*/}
            {/*  <CLoading size="sm" type="text" />*/}
            {/*) : (*/}
            <span className={cx('guide__amount')}>
              {isContainBsc(selectedMethods) && (
                <>
                  <BscSVG size="md" />
                  {getBalanceBsc()}
                </>
              )}
              &nbsp;
              {isContainStellarOB(selectedMethods) && (
                <>
                  <StellarSVG size="md" />
                  {getBalanceStellar()}
                </>
              )}
            </span>
            {/*)}*/}
          </div>
        </div>
        <div
          className={cx('block-content', 'form-transfer')}
          // style={{ pointerEvents: loadingUnlock || isTransactionLoading || loadingFetchBalances ? 'none' : 'auto' }}
          style={{ pointerEvents: loadingUnlock || isTransactionLoading ? 'none' : 'auto' }}
        >
          <form id="novalidatedform" noValidate />
          <InputBase
            // className={cx(['input', warning && !loadingFetchBalances && 'input--error'])}
            className={cx(['input', warning && 'input--error'])}
            type={'number'}
            readOnly={isSORLoading}
            value={amountFrom}
            onKeyPress={(event) => disableInvalidCharacters(event)}
            onKeyUp={disableNumberInputUpDown}
            onKeyDown={disableNumberInputUpDown}
            onWheel={(event) => disableNumberInputScroll(event)}
            onChange={
              (e) => handleChangeAmountFrom(e.target.value)
              // isSwitched ? handleChangeAmountTo(e.target.value) : handleChangeAmountFrom(e.target.value)
            }
            inputProps={{ form: 'novalidatedform' }}
            startAdornment={
              <>
                <div className={cx('token-label')}>
                  {isSwitched ? selectedPair?.quote_name : selectedPair?.base_name}
                </div>
                <Divider orientation="vertical" variant="middle" className={cx('divider')} flexItem />
              </>
            }
            endAdornment={
              inputTo &&
              isSORLoading && (
                <div className={cx('loading')}>
                  <LoadingSVG activeColor={'#1A88C9'} size="lg" />
                </div>
              )
            }
          />
          {/*{warning && !loadingFetchBalances && <div className={cx('error')}>{warning}</div>}*/}
          {warning && <div className={cx('error')}>{warning}</div>}
          <div>
            <IconButton disabled={disableSwitchButton} className={cx('switch-button')} onClick={switchTokens}>
              <ImportExportRounded />
            </IconButton>
            <span style={{ fontSize: 14, color: 'var(--color-body)' }}>
              {isSORLoading ? <CLoading size="sm" type="text" /> : exchangeValue}
            </span>
          </div>
          <InputBase
            className={cx(['input', !!warningAmountTo && 'input--error'])}
            type={'number'}
            readOnly={isSORLoading}
            value={amountTo}
            onKeyPress={(event) => disableInvalidCharacters(event)}
            onKeyUp={disableNumberInputUpDown}
            onKeyDown={disableNumberInputUpDown}
            onWheel={(event) => disableNumberInputScroll(event)}
            onChange={
              (e) => handleChangeAmountTo(e.target.value)
              // isSwitched ? handleChangeAmountFrom(e.target.value) : handleChangeAmountTo(e.target.value)
            }
            inputProps={{ form: 'novalidatedform' }}
            startAdornment={
              <>
                <div className={cx('token-label')}>
                  {isSwitched ? selectedPair?.base_name : selectedPair?.quote_name}
                </div>
                <Divider orientation="vertical" variant="middle" className={cx('divider')} flexItem />
              </>
            }
            endAdornment={
              !inputTo &&
              isSORLoading && (
                <div className={cx('loading')}>
                  <LoadingSVG activeColor={'#1A88C9'} size="lg" />
                </div>
              )
            }
          />
          {!!warningAmountTo && <div className={cx('error')}>{warningAmountTo}</div>}
          {/* Slippage tolerance */}
          <SlippageTolerance maxSlippage={'90'} warning={slippageWarning} />
          {!isSingleBscLP(selectedMethods) && <p className={cx('executing-time')}>Executing time: 20 - 30 seconds</p>}
          {/* View order routing */}
          <ViewOrderRouting data={sorData} />
          {/* Confidence interval */}
          <ConfidenceInterval effectiveExecutablePrice={getEffectiveExecutablePrice()} />
        </div>
        {contentButtonWallet ? (
          <ButtonBase onClick={handleOpenConnectDialog} className={cx('trade-button')}>
            {contentButtonWallet}
          </ButtonBase>
        ) : !openUnlockDigitalCredit ? (
          <button className={cx('trade-button')} disabled={isSwapDisabled()} onClick={onSubmit}>
            <span>{submitText()}</span>
          </button>
        ) : (
          <button className={cx('trade-button')} disabled={loadingUnlock} onClick={onSubmit}>
            {loadingUnlock ? (
              <LoadingSVG size="lg" />
            ) : (
              <span>Unlock {isSwitched ? selectedPair?.quote_symbol : selectedPair?.base_symbol}</span>
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default SwapForm;
