/* eslint-disable @typescript-eslint/no-unused-vars */
import { BigNumber } from '@0x/utils';
import { Box, ButtonBase, Divider, InputBase } from '@material-ui/core';
import classnames from 'classnames/bind';
/* eslint-disable max-len */
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import BscSVG from 'src/assets/icon/BscSVG';
import StellarSVG from 'src/assets/icon/StellarSVG';
import Button from 'src/components/Base/Button/Button';
import { ISelect } from 'src/components/Base/Select/Select';
import Select2 from 'src/components/Base/Select2';
import CleanNumber from 'src/components/CleanNumber';
import OrderConfirmation from 'src/components/OrderConfirmation/components/OrderConfirmation';
import eventBus from 'src/event/event-bus';
import ConfidenceInterval from 'src/features/ConfidenceInterval';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { getBscAddress, getStellarAddress } from 'src/features/ConnectWallet/helpers/getAddress';
import { setOpenConnectDialog, setOpenWrongNetworkWarning } from 'src/features/ConnectWallet/redux/wallet';
import { EORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { refreshOpenOrder } from 'src/features/MyTransactions/MyTransactions.slice';
import { orderbookSelector } from 'src/features/Orderbook/helpers/orderbookHelper';
import SORPrice from 'src/features/OrderForm/components/SORPrice';
import SORTypeSelect from 'src/features/OrderForm/components/SORType';
import FeeTooltip from 'src/features/OrderForm/components/Tooltip/FeeTooltip';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import {
  BSCError,
  FreighterErrorMessage,
  MetaMaskErrorMessage,
  StellarOperationErrorCode,
  StellarTransactionErrorCode,
} from 'src/features/OrderForm/constants/error';
import { Message } from 'src/features/OrderForm/constants/message';
import { DEFAULT_MIN_AMOUNT, DEFAULT_MIN_TOTAL } from 'src/features/OrderForm/constants/minimumAmountTotal';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { handleApproveAll, isApprovedAll } from 'src/features/OrderForm/helpers/approve/approve';
import { isFullyMatch } from 'src/features/OrderForm/helpers/createNewOrderFormat/createStellarOfferType2';
import {
  isCombineOB,
  isConnectedWalletWithSuitableNetwork,
  isContainBscOB,
  isContainStellarOB,
  isSingleBscOB,
  isSingleStellarOB,
  isSOR,
  isSORCombined2Network,
} from 'src/features/OrderForm/helpers/network/checkNetwork';
import { getAsset } from 'src/features/OrderForm/helpers/sendStellarOffer';
import { openErrorSnackbar } from 'src/features/OrderForm/helpers/snackbar';
import { submitBscMarketOrder, submitStellarMarketOffer } from 'src/features/OrderForm/helpers/submit';
import {
  fetchFee,
  setIsCanceling,
  setOpenCancelStellarOrder,
  setOpenOrderCannotBeExecutedWarning,
  setOpenWrongFreighterAccountWarning,
  setOpenWrongNetworkWarning2,
  setOrderId,
  setStellarOfferId,
} from 'src/features/OrderForm/redux/orderForm';
import styles from 'src/features/OrderForm/styles/MarketOrder.module.scss';
import SlippageTolerance from 'src/features/SlippageTolerance';
import { Source } from 'src/features/SOR/constances/source';
import { getAmount } from 'src/features/SOR/helpers/getAmount';
import { getIncludedSourcesFromSelectedMethod } from 'src/features/SOR/helpers/getIncludedSources';
import { getNeededAmount } from 'src/features/SOR/helpers/getNeededAmount';
import { getRole } from 'src/features/SOR/helpers/getRole';
import { clearSorData, getSORdata, setIsLoadingSORData } from 'src/features/SOR/redux/sor';
import {
  disableInvalidCharacters,
  disableNumberInputScroll,
  disableNumberInputUpDown,
} from 'src/features/SwapForm/helpers/disableInvalidNumberInput';
import ViewOrderRouting from 'src/features/ViewOrderRouting/components/ViewOrderRouting';
import { getAvailableBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import { sleep } from 'src/helpers/share';
import { warpFromBscToStellar, warpFromStellarToBsc, WarpStatus } from 'src/helpers/warp/warp';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

const MarketOrder: React.FC = () => {
  const [behaviour, setBehaviour] = useState<Behaviour>(Behaviour.BUY);
  const sorType = useAppSelector((state) => state.orderForm.sorType);
  const [amountTotal, setAmountTotal] = useState<string>('');
  const stellarTradingFee = useAppSelector((state) => state.orderForm.tradingFee.stellarMarketOrder);
  const bscTradingFee = useAppSelector((state) => state.orderForm.tradingFee.bscMarketOrder);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const [price, setPrice] = useState<string>('');
  const wallet = useAppSelector((state) => state.wallet);
  const options: ISelect[] = [
    {
      label: 'Amount',
      value: 'Amount',
    },
    {
      label: 'Total',
      value: 'Total',
    },
  ];
  const [option, setOption] = useState<ISelect>(options[0]);
  const slippageTolerance = useAppSelector((state) => state.slippage.slippageTolerance);
  const customSlippageTolerance = useAppSelector((state) => state.slippage.customSlippageTolerance);
  const minAmount = useAppSelector((state) => state.pair.selectedPair?.minimum_amount || DEFAULT_MIN_AMOUNT);
  const minTotal = useAppSelector((state) => state.pair.selectedPair?.minimum_total || DEFAULT_MIN_TOTAL);
  const [openMinAmountTotalErrorMessage, setOpenMinAmountTotalErrorMessage] = useState<boolean>(false);
  const [balanceBsc, setBalanceBsc] = useState<string>('');
  const [balanceStellar, setBalanceStellar] = useState<string>('');
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const [openOrderConfirmationDialog, setOpenOrderConfirmationDialog] = useState<boolean>(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [maxAmountTotal, setMaxAmountTotal] = useState<string>('');
  const dispatch = useAppDispatch();
  const orderBook = useAppSelector(orderbookSelector);
  const sorData = useAppSelector((state) => state.sor);
  const [openUnlockDigitalCredit, setOpenUnlockDigitalCredit] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const isRefreshOpenOrder = useAppSelector((state) => state.myTransaction.refreshOrder);
  const averagePrice = useAppSelector((state) => {
    let ap = new BigNumber(state.sor.averagePrice);
    if (option.value === 'Total') {
      ap = new BigNumber(1).div(ap);
    }
    return ap.isNaN() || !ap.isFinite() ? '' : ap.toString();
  });

  const getEffectiveExecutablePrice = () => {
    return isSOR(selectedMethods) ? averagePrice : price;
  };

  const debounceTimeout = useRef<any>(null);

  const getPrecision = (precision?: string | number | BigNumber): number | null => {
    if (precision) {
      const p = new BigNumber(Math.log10(Number(precision))).negated();
      return p.isGreaterThanOrEqualTo(0) ? Number(p.toFixed()) : null;
    }
    return null;
  };

  const getNumberRegex = (precision: number): RegExp => {
    return new RegExp(`^\\d{0,100}.\\d{0,${precision}}$`);
  };
  const amountRegex = getNumberRegex(getPrecision(selectedPair?.amount_precision) || 2);
  const totalRegex = getNumberRegex(getPrecision(selectedPair?.amount_precision) || 2);
  // const totalRegex = getNumberRegex(
  //   getPrecision(selectedPair && new BigNumber(selectedPair.price_precision).times(selectedPair.amount_precision)) || 7,
  // );

  // format
  const formatValidAmount = (amount: string | number | BigNumber): string => {
    if (new BigNumber(amount).isNaN()) {
      return '';
    }
    return new BigNumber(amount).toFixed(getPrecision(selectedPair?.amount_precision) || 2);
  };
  const formatValidTotal = (total: string | number | BigNumber): string => {
    if (new BigNumber(total).isNaN()) {
      return '';
    }
    return new BigNumber(total).toFixed(getPrecision(selectedPair?.amount_precision) || 2);
    // return new BigNumber(total).toFixed(
    //   getPrecision(selectedPair && new BigNumber(selectedPair.price_precision).times(selectedPair.amount_precision)) ||
    //     7,
    // );
  };
  const cleanNumber = (number: string | number | BigNumber): string => {
    if (new BigNumber(number).isNaN()) {
      return '';
    }
    return new BigNumber(number).toString();
  };

  const handleChangeAmountTotal = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      if (option.value === 'Amount') {
        if (amountRegex.test(value)) {
          setAmountTotal(value);
        } else {
          setAmountTotal(formatValidAmount(value));
        }
      } else {
        if (totalRegex.test(value)) {
          setAmountTotal(value);
        } else {
          setAmountTotal(formatValidTotal(value));
        }
      }
    } else {
      setAmountTotal('');
      setOpenMinAmountTotalErrorMessage(false);
    }
  };

  const validMaxAmountTotal = (): boolean => {
    if (amountTotal && selectedMethods) {
      const currentSlippageTolerance = customSlippageTolerance
        ? new BigNumber(customSlippageTolerance).dividedBy(100).toNumber()
        : new BigNumber(slippageTolerance).dividedBy(100).toNumber();

      const currentPrice = isSOR(selectedMethods) ? sorData.price : price;
      const calculatedPrice =
        behaviour === Behaviour.BUY
          ? new BigNumber(currentPrice).plus(new BigNumber(currentPrice).times(currentSlippageTolerance))
          : new BigNumber(currentPrice).minus(new BigNumber(currentPrice).times(currentSlippageTolerance));

      const amount =
        option.value === 'Amount' ? new BigNumber(amountTotal) : new BigNumber(calculatedPrice).times(amountTotal);
      const total =
        option.value === 'Amount' ? new BigNumber(calculatedPrice).times(amountTotal) : new BigNumber(amountTotal);
      if (isSingleStellarOB(selectedMethods) && balanceStellar) {
        if (new BigNumber(behaviour === Behaviour.BUY ? total : amount).gt(balanceStellar)) {
          setMaxAmountTotal(new BigNumber(balanceStellar).dp(7, BigNumber.ROUND_DOWN).toString());
          return false;
        }
      }

      if (isSingleBscOB(selectedMethods) && balanceBsc) {
        if (new BigNumber(behaviour === Behaviour.BUY ? total : amount).gt(balanceBsc)) {
          setMaxAmountTotal(new BigNumber(balanceBsc).dp(7, BigNumber.ROUND_DOWN).toString());
          return false;
        }
      }

      if (isCombineOB(selectedMethods) && balanceStellar && balanceBsc) {
        if (
          new BigNumber(behaviour === Behaviour.BUY ? total : amount).gt(new BigNumber(balanceStellar).plus(balanceBsc))
        ) {
          setMaxAmountTotal(new BigNumber(balanceStellar).plus(balanceBsc).dp(7, BigNumber.ROUND_DOWN).toString());
          return false;
        }
      }

      setMaxAmountTotal('');
      return true;
    } else {
      setMaxAmountTotal('');
      return false;
    }
  };

  const validMinAmountTotal = (): boolean => {
    if (new BigNumber(amountTotal).gt(0)) {
      if (option.value === 'Amount') {
        if (new BigNumber(amountTotal).lt(minAmount)) {
          setOpenMinAmountTotalErrorMessage(true);
          return false;
        } else {
          setOpenMinAmountTotalErrorMessage(false);
          return true;
        }
      } else if (option.value === 'Total') {
        if (new BigNumber(amountTotal).lt(minTotal)) {
          setOpenMinAmountTotalErrorMessage(true);
          return false;
        } else {
          setOpenMinAmountTotalErrorMessage(false);
          return true;
        }
      }
    }
    return false;
  };

  const handleOnBlurAmountTotal = () => {
    setAmountTotal(cleanNumber(amountTotal));
  };

  const handleSelect = (value: ISelect) => {
    const currentSlippageTolerance = customSlippageTolerance
      ? new BigNumber(customSlippageTolerance).dividedBy(100).toNumber()
      : new BigNumber(slippageTolerance).dividedBy(100).toNumber();

    let calculatedPrice =
      behaviour === Behaviour.BUY
        ? new BigNumber(price).plus(new BigNumber(price).times(currentSlippageTolerance))
        : new BigNumber(price).minus(new BigNumber(price).times(currentSlippageTolerance));
    if (calculatedPrice.lte(0)) {
      calculatedPrice = new BigNumber(selectedPair?.price_precision || '0');
    }

    setOption(value);
    if (isSingleStellarOB(selectedMethods) && isSingleBscOB(selectedMethods)) {
      if (value.value === 'Total' && new BigNumber(amountTotal).gt(0) && new BigNumber(price).gt(0)) {
        setAmountTotal(cleanNumber(formatValidTotal(new BigNumber(amountTotal).times(calculatedPrice))));
      } else if (value.value === 'Amount' && new BigNumber(amountTotal).gt(0) && new BigNumber(price).gt(0)) {
        setAmountTotal(cleanNumber(formatValidAmount(new BigNumber(amountTotal).div(calculatedPrice))));
      } else {
        setAmountTotal('');
      }
    } else {
      setAmountTotal('');
    }
  };

  // Connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  // order confirmation dialog
  const handleOpenOrderConfirmationDialog = () => {
    // disable loading before open
    if (validMaxAmountTotal() && validMinAmountTotal()) {
      setIsCreatingOrder(false);
      setOpenOrderConfirmationDialog(true);
    }
  };
  const handleCloseOrderConfirmationDialog = () => {
    setOpenOrderConfirmationDialog(false);
  };

  // wrong network warning dialog
  const handleOpenWrongNetworkWaringDialog = () => {
    dispatch(setOpenWrongNetworkWarning2(true));
  };

  // cancel stellar order dialog
  const handleOpenCancelStellarOrderDialog = () => {
    setIsCreatingOrder(false);
    dispatch(setIsCanceling(false));
    dispatch(setOpenCancelStellarOrder(true));
  };
  const handleCloseCancelStellarOrderDialog = () => {
    dispatch(setOpenCancelStellarOrder(false));
  };

  // order can not be executed right now warning
  const handleOpenOrderCannotBeExecutedWarning = () => {
    dispatch(setOpenOrderCannotBeExecutedWarning(true));
  };

  // wrong freighter account warning
  const handleOpenWrongFreighterAccountWarning = () => {
    dispatch(setOpenWrongFreighterAccountWarning(true));
  };

  const fetchBalance = async () => {
    if (getStellarAddress(wallet) && selectedPair) {
      const address = getStellarAddress(wallet);
      const balance =
        behaviour === Behaviour.BUY
          ? await getAvailableBalanceInStellar(
              address,
              selectedPair.quote_type,
              selectedPair.quote_symbol,
              selectedPair.quote_stellar_issuer,
            )
          : await getAvailableBalanceInStellar(
              address,
              selectedPair.base_type,
              selectedPair.base_symbol,
              selectedPair.base_stellar_issuer,
            );
      setBalanceStellar(balance);
    } else {
      setBalanceStellar('');
    }

    if (getBscAddress(wallet) && selectedPair) {
      const balance =
        behaviour === Behaviour.BUY
          ? await getBalanceInBsc(getBscAddress(wallet), selectedPair.quote_bsc_address, selectedPair.quote_decimal)
          : await getBalanceInBsc(getBscAddress(wallet), selectedPair.base_bsc_address, selectedPair.base_decimal);
      setBalanceBsc(balance);
    } else {
      setBalanceBsc('');
    }
  };

  const fetchPrice = () => {
    try {
      if (behaviour === Behaviour.BUY) {
        const p = new BigNumber(orderBook.asks[0]?.price || '0');
        setPrice(p.toString());
      } else {
        const p = new BigNumber(orderBook.bids[0]?.price || '0');
        setPrice(p.toString());
      }
    } catch (e) {
      // console.log(e);
    }
  };

  const fetchSORData = async () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        if (new BigNumber(amountTotal).gt(0) && selectedPair && isCombineOB(selectedMethods)) {
          dispatch(setIsLoadingSORData(true));

          let currentActionWithAmountTotal: Behaviour;
          if (option.value === 'Amount') {
            currentActionWithAmountTotal = behaviour;
          } else {
            currentActionWithAmountTotal = behaviour === Behaviour.BUY ? Behaviour.SELL : Behaviour.BUY;
          }

          const role = await getRole(getBscAddress(wallet));

          const param = {
            buyToken: behaviour === Behaviour.BUY ? selectedPair.base_bsc_address : selectedPair.quote_bsc_address,
            sellToken: behaviour === Behaviour.SELL ? selectedPair.base_bsc_address : selectedPair.quote_bsc_address,
            amount: new BigNumber(amountTotal)
              .times(
                new BigNumber(10).pow(
                  option.value === 'Amount' ? selectedPair.base_decimal : selectedPair.quote_decimal,
                ),
              )
              .toString(),
            behaviour: currentActionWithAmountTotal,
            xlmFeeRate: stellarTradingFee,
            fcxFeeRate: bscTradingFee,
            xlmSellTokenBalance: new BigNumber(balanceStellar)
              .times(
                new BigNumber(10).pow(
                  option.value === 'Amount' ? selectedPair.quote_decimal : selectedPair.base_decimal,
                ),
              )
              .toString(),
            bscSellTokenBalance: new BigNumber(balanceBsc)
              .times(
                new BigNumber(10).pow(
                  option.value === 'Amount' ? selectedPair.quote_decimal : selectedPair.base_decimal,
                ),
              )
              .toString(),
            includedSources: getIncludedSourcesFromSelectedMethod(selectedMethods, role),
            sorType,
            amountPrecision: getPrecision(selectedPair.amount_precision) || -1,
            pricePrecision: getPrecision(selectedPair.price_precision) || -1,
            // decimal: getMakerDecimal(selectedPair, behaviour, option.value),
            decimal: option.value === 'Amount' ? selectedPair.base_decimal : selectedPair.quote_decimal,
            behaviourWithPair: behaviour,
          };
          dispatch(getSORdata(param));
        } else {
          // clear data
          dispatch(clearSorData());
        }
      } catch (e) {
        // console.log(e);
      } finally {
        // dispatch(setIsLoadingSORData(false));
      }
    }, 1000);
  };

  const resetData = () => {
    setAmountTotal('');
    setMaxAmountTotal('');
    setOption(options[0]);
    dispatch(clearSorData());
  };

  // -------------------------------- SUBMIT ORDER --------------------------------
  // const checkNetworkData = checkNetwork(wallet, selectedMethods);
  const submit = async () => {
    try {
      // loading
      setIsCreatingOrder(true);
      // // check network of wallet and trading method are on the same network
      // if (!checkNetworkData.isOnTheSameNetwork) {
      //   dispatch(setCheckNetworkData(checkNetworkData));
      //   handleOpenWrongNetworkWaringDialog();
      // } else {
      if (validMinAmountTotal() && validMaxAmountTotal()) {
        // ------------------- single bsc order -------------------
        if (isSingleBscOB(selectedMethods) && selectedPair) {
          // ----- bsc market order -----
          try {
            if (new BigNumber(price).isGreaterThan(0)) {
              await submitBscMarketOrder({
                amountTotal,
                price: new BigNumber(price).toFixed(getPrecision(selectedPair.price_precision) || 5),
                selectedPair,
                customSlippageTolerance,
                slippageTolerance,
                behaviour,
                bscTradingFee,
                wallet,
                option,
              });
            } else {
              handleOpenOrderCannotBeExecutedWarning();
            }
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

        // ------------------- single stellar offer -------------------
        else if (isSingleStellarOB(selectedMethods) && selectedPair) {
          // ----- stellar market offer -----
          try {
            if (new BigNumber(price).gt(0)) {
              const res = await submitStellarMarketOffer({
                amountTotal,
                price: new BigNumber(price).toFixed(getPrecision(selectedPair.price_precision) || 5),
                selectedPair,
                customSlippageTolerance,
                slippageTolerance,
                behaviour,
                stellarTradingFee,
                wallet,
                option,
              });
              if (res.stellar && res.api) {
                dispatch(setStellarOfferId(res.api.data.stellar_id));
                dispatch(setOrderId(res.api.data.id));
                if (!(await isFullyMatch(res.stellar))) {
                  handleOpenCancelStellarOrderDialog();
                }
              }
            } else {
              handleOpenOrderCannotBeExecutedWarning();
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

        // ------------------- combine order book -------------------
        else if (isCombineOB(selectedMethods) && selectedPair) {
          try {
            const currentPrice = sorData.price;

            // get needed amount for warping
            const neededAmount = getNeededAmount(
              balanceStellar,
              balanceBsc,
              sorData,
              behaviour,
              currentPrice,
              option.value,
              slippageTolerance,
              customSlippageTolerance,
            );
            // console.log('neededAmount', neededAmount);

            // warp
            if (new BigNumber(neededAmount.bsc).gt(0) && sorType === SORType.MARKET_SOR) {
              const currentAssets = getAsset(
                behaviour === Behaviour.BUY ? selectedPair.quote_symbol : selectedPair.base_symbol,
                behaviour === Behaviour.BUY ? selectedPair.quote_stellar_issuer : selectedPair.base_stellar_issuer,
                behaviour === Behaviour.BUY ? selectedPair.quote_type : selectedPair.base_type,
              );

              // (Market SOR) Warp stellar to bsc then create order
              // console.log('run warp, stellar to bsc');
              await warpFromStellarToBsc(
                getStellarAddress(wallet),
                getBscAddress(wallet),
                behaviour === Behaviour.BUY ? selectedPair.quote_warp_type_id : selectedPair.base_warp_type_id,
                neededAmount.bsc,
                currentAssets,
                wallet,
              );
            } else if (new BigNumber(neededAmount.stellar).gt(0) && sorType === SORType.MARKET_SOR) {
              // (Market SOR) Warp bsc to stellar then create order
              // console.log('run warp, bsc to stellar');
              await warpFromBscToStellar(
                getBscAddress(wallet),
                getStellarAddress(wallet),
                behaviour === Behaviour.BUY ? selectedPair.quote_warp_type_id : selectedPair.base_warp_type_id,
                neededAmount.stellar,
                behaviour === Behaviour.BUY ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address,
                behaviour === Behaviour.BUY ? selectedPair.quote_decimal : selectedPair.base_decimal,
              );
            }

            // let currentPrice = sorData.price;
            // if (option.value === 'Total') {
            //   currentPrice = new BigNumber(1).div(sorData.price).toString();
            // }

            // ----- bsc market order -----
            try {
              if (new BigNumber(currentPrice).gt(0) && new BigNumber(sorData.bscOB.amount).gt(0)) {
                await submitBscMarketOrder({
                  amountTotal: getAmount(sorData, Source.BscOBSource),
                  price: new BigNumber(currentPrice).toFixed(getPrecision(selectedPair.price_precision) || 5),
                  selectedPair,
                  customSlippageTolerance,
                  slippageTolerance,
                  behaviour,
                  bscTradingFee,
                  wallet,
                  option,
                });
              }
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

            // ----- stellar market offer -----
            try {
              if (new BigNumber(currentPrice).gt(0) && new BigNumber(sorData.stellarOB.amount).gt(0)) {
                const res = await submitStellarMarketOffer({
                  amountTotal: getAmount(sorData, Source.StellarOBSource),
                  price: new BigNumber(currentPrice).toFixed(getPrecision(selectedPair.price_precision) || 5),
                  selectedPair,
                  customSlippageTolerance,
                  slippageTolerance,
                  behaviour,
                  stellarTradingFee,
                  wallet,
                  option,
                });
                if (res.stellar && res.api) {
                  dispatch(setStellarOfferId(res.api.data.stellar_id));
                  dispatch(setOrderId(res.api.data.id));
                  if (!(await isFullyMatch(res.stellar))) {
                    handleOpenCancelStellarOrderDialog();
                  }
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
          } catch (e) {
            if (e.message === WarpStatus.FAILED) {
              openErrorSnackbar(Message.WARP_FAILED);
            } else if (
              e === FreighterErrorMessage.USER_DECLINED_ACCESS ||
              e === MetaMaskErrorMessage.DENIED_MESSAGE_SIGNATURE ||
              e === MetaMaskErrorMessage.DENIED_TRANSACTION_SIGNATURE
            ) {
              openErrorSnackbar(Message.WARP_TRANSACTION_REJECTED);
            }
          }
        }
      }
      // }
    } catch (error) {
    } finally {
      resetData();
      dispatch(refreshOpenOrder(!isRefreshOpenOrder));
      handleCloseOrderConfirmationDialog();
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await handleApproveAll(getBscAddress(wallet), behaviour, isSOR(selectedMethods) ? sorType : null, selectedPair);

      await (async () => {
        setOpenUnlockDigitalCredit(
          !(await isApprovedAll(
            getBscAddress(wallet),
            behaviour,
            isSOR(selectedMethods) && (isContainStellarOB(selectedMethods) || isContainBscOB(selectedMethods))
              ? sorType
              : null,
            selectedPair,
          )) && isContainBscOB(selectedMethods),
        );
      })();
    } catch (e) {
      // console.log(e);
    }

    setIsApproving(false);
  };

  const isDisableTrade = () => {
    const isMissingInput = !new BigNumber(amountTotal).gt(0);
    const isFetchingSORData = isCombineOB(selectedMethods) && !new BigNumber(sorData.price).gt(0);
    return isMissingInput || isFetchingSORData;
  };

  let interval: NodeJS.Timeout;
  useEffect(() => {
    clearInterval(interval);
    fetchBalance();
    interval = setInterval(() => {
      fetchBalance();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [wallet, selectedPair, behaviour]);

  useEffect(() => {
    dispatch(fetchFee());
    eventBus.on(SocketEvent.TradingFeeUpdated, async (): Promise<void> => {
      await sleep(1000);
      dispatch(fetchFee());
    });
  }, []);

  useEffect(() => {
    fetchPrice();
  }, [behaviour, orderBook]);

  useEffect(() => {
    if (isCombineOB(selectedMethods)) {
      dispatch(clearSorData());
    }
    if (new BigNumber(amountTotal).gt(0) && selectedPair && isCombineOB(selectedMethods)) {
      fetchSORData();
    }
  }, [
    sorType,
    selectedPair,
    selectedMethods,
    amountTotal,
    balanceStellar,
    balanceBsc,
    option,
    slippageTolerance,
    customSlippageTolerance,
  ]);

  // useEffect(() => {
  //   setMaxAmountTotal('');
  // }, [behaviour]);

  useEffect(() => {
    // clean up when change pair, behaviour, trading methods
    resetData();
  }, [selectedPair, behaviour, selectedMethods.length]);

  // check approve
  useEffect(() => {
    (async () => {
      setOpenUnlockDigitalCredit(
        !(await isApprovedAll(
          getBscAddress(wallet),
          behaviour,
          isSOR(selectedMethods) && (isContainStellarOB(selectedMethods) || isContainBscOB(selectedMethods))
            ? sorType
            : null,
          selectedPair,
        )) && isContainBscOB(selectedMethods),
      );
    })();
  }, [wallet, behaviour, selectedMethods, sorType, selectedPair]);

  return (
    <>
      <div className={cx('container')}>
        <div className={cx('container-line-1')}>
          <div className={cx('tab-button-container')}>
            <div>
              <button
                className={cx(behaviour === Behaviour.BUY ? 'tab-button-left-active' : 'tab-button-left')}
                onClick={() => {
                  setBehaviour(Behaviour.BUY);
                }}
              >
                <span>Buy</span>
              </button>
              <button
                className={cx(behaviour === Behaviour.SELL ? 'tab-button-right-active' : 'tab-button-right')}
                onClick={() => {
                  setBehaviour(Behaviour.SELL);
                }}
              >
                <span>Sell</span>
              </button>
            </div>
          </div>

          {isCombineOB(selectedMethods) && <SORTypeSelect />}
        </div>

        <div className={cx('form-container')}>
          <div className={cx('info')}>
            <div className={cx('buy-sell-info')}>
              <p>
                {behaviour === Behaviour.BUY ? 'Buy' : 'Sell'} {selectedPair?.base_symbol}
              </p>
              <FeeTooltip />
            </div>

            {selectedPair && (
              <div className={cx('balance-container')}>
                {(isSingleBscOB(selectedMethods) || isSORCombined2Network(selectedMethods)) && (
                  <div className={cx('balance-1')}>
                    <BscSVG size={'lg'} />
                    {/*{formatBalance(balanceBsc) || '0.0000000'}*/}
                    <CleanNumber number={balanceBsc || '0'} maxDigits={20} fixedDecimal={7} />
                    &nbsp;
                    {behaviour === Behaviour.BUY ? selectedPair.quote_symbol : selectedPair.base_symbol}
                  </div>
                )}

                {(isSingleStellarOB(selectedMethods) || isSORCombined2Network(selectedMethods)) && (
                  <div className={cx('balance-2')}>
                    <StellarSVG size={'lg'} />
                    {/*{formatBalance(balanceStellar) || '0.0000000'}{' '}*/}
                    <CleanNumber number={balanceStellar || '0'} maxDigits={20} fixedDecimal={7} />
                    &nbsp;
                    {behaviour === Behaviour.BUY ? selectedPair.quote_symbol : selectedPair.base_symbol}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={cx('scroller')}>
            <form id="novalidatedform" noValidate />
            <InputBase
              className={cx('input')}
              type={'number'}
              disabled={true}
              // value={price}
              // onChange={handleChangePrice}
              startAdornment={<div className={cx('placeholder-left')}>Price</div>}
              endAdornment={
                <>
                  <div className={cx('market')}>Market</div>
                  {selectedPair && <div className={cx('placeholder-right')}>{selectedPair.quote_symbol}</div>}
                </>
              }
            />
            <InputBase
              id={'amount-input'}
              className={cx(
                'input',
                (maxAmountTotal || openMinAmountTotalErrorMessage) && isConnected(wallet) && 'error-border',
              )}
              value={!!(amountTotal || amountTotal === '0') ? amountTotal : ''}
              onWheel={disableNumberInputScroll}
              onKeyPress={disableInvalidCharacters}
              onKeyUp={disableNumberInputUpDown}
              onKeyDown={disableNumberInputUpDown}
              onChange={handleChangeAmountTotal}
              onBlur={() => {
                handleOnBlurAmountTotal();
                validMaxAmountTotal();
                validMinAmountTotal();
              }}
              type={'number'}
              inputProps={{ form: 'novalidatedform' }}
              startAdornment={
                <>
                  <div className={cx('select')}>
                    <Select2 options={options} option={option} onClick={handleSelect} variant={'raw'} />
                  </div>
                  {/* divider*/}
                  <Divider orientation="vertical" className={cx('divider')} flexItem />
                </>
              }
              endAdornment={
                <>
                  {selectedPair && (
                    <label htmlFor={'amount-input'} className={cx('placeholder-right', 'text-cursor')}>
                      {option.value === 'Total' ? selectedPair.quote_symbol : selectedPair.base_symbol}
                    </label>
                  )}
                </>
              }
            />
            {maxAmountTotal && behaviour === Behaviour.SELL && (
              <div className={cx('error-text')}>
                Max amount: {maxAmountTotal || '-'} {' ' + selectedPair?.base_symbol}
              </div>
            )}
            {maxAmountTotal && behaviour === Behaviour.BUY && isConnected(wallet) && (
              <div className={cx('error-text')}>
                Max total: {maxAmountTotal || '-'} {' ' + selectedPair?.quote_symbol}
              </div>
            )}
            {openMinAmountTotalErrorMessage && isConnected(wallet) && (
              <div className={cx('error-text')}>
                {option.value} can not be smaller than {option.value === 'Amount' ? minAmount : minTotal}
              </div>
            )}

            {/* Slippage tolerance*/}
            <SlippageTolerance maxSlippage={behaviour === Behaviour.BUY ? '100' : '90'} behaviour={behaviour} />

            {/*SOR Price*/}
            {isSOR(selectedMethods) && <SORPrice price={averagePrice} />}

            {/* TrustLine*/}
            {/*{isSingleStellarOB(selectedMethods) && <TrustLine />}*/}

            {/* View order routing*/}
            {isSOR(selectedMethods) && <ViewOrderRouting />}

            {/* Confidence interval*/}
            <ConfidenceInterval effectiveExecutablePrice={getEffectiveExecutablePrice()} />
          </div>

          {/*  submit buy/sell*/}
          {!isConnectedWalletWithSuitableNetwork(wallet, selectedMethods).isConnected ? (
            <ButtonBase
              onClick={handleOpenConnectDialog}
              className={cx('connect-wallet-in-order-form', behaviour === Behaviour.BUY ? 'bg-green' : 'bg-red')}
              disableRipple={true}
            >
              {isConnectedWalletWithSuitableNetwork(wallet, selectedMethods).buttonContent}
            </ButtonBase>
          ) : openUnlockDigitalCredit ? (
            <Button
              size={'xs'}
              type={'primary'}
              onClick={handleApprove}
              classNamePrefix={cx('unlock-digital-credit', behaviour === Behaviour.BUY ? 'bg-green' : 'bg-red')}
              isLoading={isApproving}
              content={`Unlock ${
                behaviour === Behaviour.BUY ? selectedPair?.quote_symbol || '...' : selectedPair?.base_symbol || '...'
              }`}
            />
          ) : (
            <Box className={cx('submit-container')}>
              <ButtonBase
                className={cx(
                  'submit',
                  behaviour === Behaviour.BUY ? 'bg-green' : 'bg-red',
                  isDisableTrade() && 'disabled',
                )}
                onClick={handleOpenOrderConfirmationDialog}
                disableRipple={true}
                disabled={isDisableTrade()}
              >
                {behaviour}
              </ButtonBase>
            </Box>
          )}
        </div>
      </div>

      <OrderConfirmation
        open={openOrderConfirmationDialog}
        isOnProcess={isCreatingOrder}
        onClose={handleCloseOrderConfirmationDialog}
        onSubmit={submit}
        submitContent={'Trade'}
        data={{
          selectedMethods,
          sorType: isCombineOB(selectedMethods) ? sorType : undefined,
          behaviour,
          selectedPair,
          orderType: EORDER_TYPE.Market,
          price: 'Market',
          amount: option.value === 'Amount' ? amountTotal : '',
          total: option.value === 'Total' ? amountTotal : '',
          slippageTolerance: customSlippageTolerance ? customSlippageTolerance : slippageTolerance,
        }}
      />
    </>
  );
};

export default MarketOrder;
