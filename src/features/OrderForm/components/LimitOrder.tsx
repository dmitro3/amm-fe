/* eslint-disable max-len */
import { BigNumber } from '@0x/utils';
import { Box, ButtonBase, InputBase } from '@material-ui/core';
import classnames from 'classnames/bind';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import ArrowDownOutline from 'src/assets/icon/ArrowDownOutline';
import BscSVG from 'src/assets/icon/BscSVG';
import StellarSVG from 'src/assets/icon/StellarSVG';
import Button from 'src/components/Base/Button/Button';
import Select2, { ISelect } from 'src/components/Base/Select2/Select2';
import CleanNumber from 'src/components/CleanNumber';
import OrderConfirmation from 'src/components/OrderConfirmation/components/OrderConfirmation';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { getBscAddress, getStellarAddress } from 'src/features/ConnectWallet/helpers/getAddress';
import { setOpenConnectDialog, setOpenWrongNetworkWarning } from 'src/features/ConnectWallet/redux/wallet';
import { EORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { refreshOpenOrder } from 'src/features/MyTransactions/MyTransactions.slice';
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
import { TimeInForce } from 'src/features/OrderForm/constants/timeInForce';
import { handleApproveAll, isApprovedAll } from 'src/features/OrderForm/helpers/approve/approve';
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
import { submitBscLimitOrder, submitStellarLimitOffer } from 'src/features/OrderForm/helpers/submit';
import { setOpenWrongFreighterAccountWarning } from 'src/features/OrderForm/redux/orderForm';
import styles from 'src/features/OrderForm/styles/LimitOrder.module.scss';
import {
  setCustomSlippageTolerance,
  setSlippageTolerance,
} from 'src/features/SlippageTolerance/redux/slippageTolerance';
import { MAX_BALANCE } from 'src/features/SOR/constances/maxBalance';
import { Source } from 'src/features/SOR/constances/source';
import { getAmount } from 'src/features/SOR/helpers/getAmount';
import { getNeededAmount } from 'src/features/SOR/helpers/getNeededAmount';
import { clearSorData, setIsLoadingSORData, updateLimitSORData } from 'src/features/SOR/redux/sor';
import {
  disableInvalidCharacters,
  disableNumberInputScroll,
  disableNumberInputUpDown,
} from 'src/features/SwapForm/helpers/disableInvalidNumberInput';
import { OrderSide } from 'src/features/User/Account/misc';
import ViewOrderRouting from 'src/features/ViewOrderRouting/components/ViewOrderRouting';
import { getAvailableBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import { warpFromBscToStellar, warpFromStellarToBsc, WarpStatus } from 'src/helpers/warp/warp';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const cx = classnames.bind(styles);

const LimitOrder: React.FC = () => {
  const [behaviour, setBehaviour] = useState<Behaviour>(Behaviour.BUY);
  const sorType = useAppSelector((state) => state.orderForm.sorType);
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const stellarTradingFee = useAppSelector((state) => state.orderForm.tradingFee.stellarLimitOrder);
  const bscTradingFee = useAppSelector((state) => state.orderForm.tradingFee.bscLimitOrder);
  const durationOptions: ISelect[] = [
    {
      label: 'Good-for-day',
      value: TimeInForce.GFD,
    },
    {
      label: 'Good-til-cancel',
      value: TimeInForce.GTC,
    },
  ];
  const [durationOption, setDurationOption] = useState<ISelect>(durationOptions[1]);
  const minAmount = useAppSelector((state) => state.pair.selectedPair?.minimum_amount || DEFAULT_MIN_AMOUNT);
  const minTotal = useAppSelector((state) => state.pair.selectedPair?.minimum_total || DEFAULT_MIN_TOTAL);
  const [openMinAmountErrorMessage, setOpenMinAmountErrorMessage] = useState<boolean>(false);
  const [openMinTotalErrorMessage, setOpenMinTotalErrorMessage] = useState<boolean>(false);
  const [balanceBsc, setBalanceBsc] = useState<string>('');
  const [balanceStellar, setBalanceStellar] = useState<string>('');
  const wallet = useAppSelector((state) => state.wallet);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const stellarOrderbook = useAppSelector((state) => state.orderbook.stellar.orderbook);
  const bscOrderbook = useAppSelector((state) => state.orderbook.bsc.orderbook);
  const [openOrderConfirmationDialog, setOpenOrderConfirmationDialog] = useState<boolean>(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [maxAmountTotal, setMaxAmountTotal] = useState<string>('');
  const sorData = useAppSelector((state) => state.sor);
  const dispatch = useAppDispatch();
  const [openUnlockDigitalCredit, setOpenUnlockDigitalCredit] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const isRefreshOpenOrder = useAppSelector((state) => state.myTransaction.refreshOrder);

  const debounceTimeout = useRef<any>(null);

  const getPrecision = (precision?: string | number | BigNumber): number | null => {
    if (precision) {
      const p = new BigNumber(Math.log10(Number(precision))).negated();
      return p.isGreaterThanOrEqualTo(0) ? Number(p.toFixed()) : null;
    }
    return null;
  };

  // regex
  const getNumberRegex = (precision: number): RegExp => {
    return new RegExp(`^\\d{0,100}.\\d{0,${precision}}$`);
  };
  const priceRegex = getNumberRegex(getPrecision(selectedPair?.price_precision) || 5);
  const amountRegex = getNumberRegex(getPrecision(selectedPair?.amount_precision) || 2);
  const totalRegex = getNumberRegex(getPrecision(selectedPair?.amount_precision) || 2);
  // const totalRegex = getNumberRegex(
  //   getPrecision(selectedPair && new BigNumber(selectedPair.price_precision).times(selectedPair.amount_precision)) || 7,
  // );

  // format
  const formatValidPrice = (price: string | number | BigNumber): string => {
    if (new BigNumber(price).isNaN()) {
      return '';
    }
    return new BigNumber(price).toFixed(getPrecision(selectedPair?.price_precision) || 5);
  };
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

  const handleChangePrice = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newPrice = '';

    if (value) {
      if (priceRegex.test(value)) {
        setPrice(value);
        newPrice = formatValidPrice(value);
      } else {
        setPrice(formatValidPrice(value));
        newPrice = formatValidPrice(value);
      }
    } else {
      setPrice('');
      newPrice = '';
    }

    if (newPrice && amount) {
      setTotal(cleanNumber(formatValidTotal(new BigNumber(newPrice).times(amount))));
    } else {
      setTotal('');
    }
  };

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newAmount = '';
    if (value) {
      if (amountRegex.test(value)) {
        setAmount(value);
        newAmount = formatValidAmount(value);
      } else {
        setAmount(formatValidAmount(value));
        newAmount = formatValidAmount(value);
      }
    } else {
      setAmount('');
      newAmount = '';
      setOpenMinAmountErrorMessage(false);
    }

    if (price && newAmount) {
      setTotal(cleanNumber(formatValidTotal(new BigNumber(price).times(newAmount))));
    } else if (newAmount && total) {
      setPrice(cleanNumber(formatValidPrice(new BigNumber(total).div(newAmount))));
    } else {
      setTotal('');
    }
  };

  const validMaxAmountTotal = (): boolean => {
    if (amount && total && selectedMethods) {
      if (isSingleStellarOB(selectedMethods) && balanceStellar) {
        if (new BigNumber(behaviour === Behaviour.BUY ? total : amount).gt(balanceStellar)) {
          setMaxAmountTotal(new BigNumber(balanceStellar).toFixed(7));
          return false;
        }
      }

      if (isSingleBscOB(selectedMethods) && balanceBsc) {
        if (new BigNumber(behaviour === Behaviour.BUY ? total : amount).gt(balanceBsc)) {
          setMaxAmountTotal(new BigNumber(balanceBsc).toFixed(7));
          return false;
        }
      }

      if (isCombineOB(selectedMethods) && balanceStellar && balanceBsc) {
        if (
          new BigNumber(behaviour === Behaviour.BUY ? total : amount).gt(new BigNumber(balanceStellar).plus(balanceBsc))
        ) {
          setMaxAmountTotal(new BigNumber(balanceStellar).plus(balanceBsc).toFixed(7));
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

  const validMinAmount = (): boolean => {
    if (new BigNumber(amount).gt(0)) {
      if (new BigNumber(amount).lt(minAmount)) {
        setOpenMinAmountErrorMessage(true);
        return false;
      } else {
        setOpenMinAmountErrorMessage(false);
        return true;
      }
    }
    return false;
  };
  const validMinTotal = (): boolean => {
    if (new BigNumber(total).gt(0)) {
      if (new BigNumber(total).lt(minTotal)) {
        setOpenMinTotalErrorMessage(true);
        return false;
      } else {
        setOpenMinTotalErrorMessage(false);
        return true;
      }
    }
    return false;
  };

  const handleChangeTotal = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newTotal = '';
    if (value) {
      if (totalRegex.test(value)) {
        setTotal(value);
        newTotal = formatValidTotal(value);
      } else {
        setTotal(formatValidTotal(value));
        newTotal = formatValidTotal(value);
      }
    } else {
      setTotal('');
      newTotal = '';
      setOpenMinTotalErrorMessage(false);
    }

    if (price && newTotal) {
      setAmount(cleanNumber(formatValidAmount(new BigNumber(newTotal).div(price))));
    } else if (amount && newTotal) {
      setPrice(cleanNumber(formatValidPrice(new BigNumber(newTotal).div(amount))));
    } else {
      setAmount('');
    }
  };

  const handleOnBlurPrice = () => {
    setPrice(cleanNumber(price));
  };

  const handleOnBlurAmount = () => {
    setAmount(cleanNumber(amount));
  };

  const handleOnBlurTotal = () => {
    setTotal(cleanNumber(total));
  };

  const handleDurationOption = (v: ISelect) => {
    setDurationOption(v);
  };

  // Connect dialog
  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  // order confirmation dialog
  const handleOpenOrderConfirmationDialog = () => {
    if (validMaxAmountTotal() && validMinAmount() && validMinTotal()) {
      // disable loading before open
      setIsCreatingOrder(false);
      setOpenOrderConfirmationDialog(true);
    }
  };
  const handleCloseOrderConfirmationDialog = () => {
    setOpenOrderConfirmationDialog(false);
  };

  // wrong network warning dialog
  // const handleOpenWrongNetworkWaringDialog = () => {
  //   dispatch(setOpenWrongNetworkWarning2(true));
  // };

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

  const fetchSORData = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      try {
        if (new BigNumber(price).gt(0) && new BigNumber(amount).gt(0) && selectedPair && isCombineOB(selectedMethods)) {
          dispatch(setIsLoadingSORData(true));

          const data = [
            {
              orderbook: stellarOrderbook,
              balance:
                sorType === SORType.MARKET_SOR
                  ? MAX_BALANCE.toString()
                  : new BigNumber(balanceStellar).gt(0)
                  ? balanceStellar
                  : '0',
              name: 'XLM',
              fee: stellarTradingFee,
            },
            {
              orderbook: bscOrderbook,
              balance:
                sorType === SORType.MARKET_SOR
                  ? MAX_BALANCE.toString()
                  : new BigNumber(balanceBsc).gt(0)
                  ? balanceBsc
                  : '0',
              name: 'FCX',
              fee: bscTradingFee,
            },
          ];
          const params = {
            data,
            side: behaviour === Behaviour.BUY ? OrderSide.Buy : OrderSide.Sell,
            price,
            amount,
            amountPrecision: selectedPair.amount_precision,
          };
          dispatch(updateLimitSORData(params));
        } else {
          // clear data
          dispatch(clearSorData());
        }
      } catch (e) {
        // console.log(e);
      }
    }, 1000);
  };

  const resetData = () => {
    setPrice('');
    setAmount('');
    setTotal('');
    setMaxAmountTotal('');
    setDurationOption(durationOptions[1]);
    dispatch(setSlippageTolerance(''));
    dispatch(setCustomSlippageTolerance(''));
    dispatch(clearSorData());
  };

  // -------------------------------- SUBMIT ORDER --------------------------------
  // const checkNetworkData = checkNetwork(wallet, selectedMethods);
  const submit = async () => {
    // loading
    try {
      setIsCreatingOrder(true);
      // check network of wallet and trading method are on the same network
      // if (!checkNetworkData.isOnTheSameNetwork) {
      //   dispatch(setCheckNetworkData(checkNetworkData));
      //   handleOpenWrongNetworkWaringDialog();
      // } else {
      if (validMinAmount() && validMinTotal() && validMaxAmountTotal()) {
        // ------------------- single bsc order -------------------
        if (isSingleBscOB(selectedMethods) && selectedPair) {
          // check chainId
          // ----- bsc limit order -----
          try {
            await submitBscLimitOrder({
              price,
              amount,
              selectedPair,
              behaviour,
              bscTradingFee,
              wallet,
              durationOption,
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

        // ------------------- single stellar offer -------------------
        else if (isSingleStellarOB(selectedMethods) && selectedPair) {
          // ----- stellar limit order -----
          try {
            await submitStellarLimitOffer({
              price,
              amount,
              selectedPair,
              behaviour,
              stellarTradingFee,
              wallet,
            });
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
            // get needed amount for warping
            const neededAmount = getNeededAmount(balanceStellar, balanceBsc, sorData, behaviour, price);

            // warp
            if (new BigNumber(neededAmount.bsc).gt(0) && sorType === SORType.MARKET_SOR) {
              const currentAssets = getAsset(
                behaviour === Behaviour.BUY ? selectedPair.quote_symbol : selectedPair.base_symbol,
                behaviour === Behaviour.BUY ? selectedPair.quote_stellar_issuer : selectedPair.base_stellar_issuer,
                behaviour === Behaviour.BUY ? selectedPair.quote_type : selectedPair.base_type,
              );

              // Warp stellar to bsc
              await warpFromStellarToBsc(
                getStellarAddress(wallet),
                getBscAddress(wallet),
                behaviour === Behaviour.BUY ? selectedPair.quote_warp_type_id : selectedPair.base_warp_type_id,
                neededAmount.bsc,
                currentAssets,
                wallet,
              );
            } else if (new BigNumber(neededAmount.stellar).gt(0) && sorType === SORType.MARKET_SOR) {
              // Warp bsc to stellar
              await warpFromBscToStellar(
                getBscAddress(wallet),
                getStellarAddress(wallet),
                behaviour === Behaviour.BUY ? selectedPair.quote_warp_type_id : selectedPair.base_warp_type_id,
                neededAmount.stellar,
                behaviour === Behaviour.BUY ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address,
                behaviour === Behaviour.BUY ? selectedPair.quote_decimal : selectedPair.base_decimal,
              );
            }

            // ----- bsc limit order -----
            try {
              await submitBscLimitOrder({
                price: sorData.price,
                amount: getAmount(sorData, Source.BscOBSource),
                selectedPair,
                behaviour,
                bscTradingFee,
                wallet,
                durationOption,
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

            // ----- stellar limit order -----
            try {
              await submitStellarLimitOffer({
                price: sorData.price,
                amount: getAmount(sorData, Source.StellarOBSource),
                selectedPair,
                behaviour,
                stellarTradingFee,
                wallet,
              });
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
    const isMissingInput = !(new BigNumber(amount).gt(0) && new BigNumber(price).gt(0) && new BigNumber(total).gt(0));
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

  // useEffect(() => {
  //   setMaxAmountTotal('');
  // }, [behaviour]);

  useEffect(() => {
    // clean up when change pair, behaviour, trading methods
    resetData();
  }, [selectedPair, behaviour, selectedMethods.length]);

  useEffect(() => {
    if (isCombineOB(selectedMethods)) {
      dispatch(clearSorData());
    }
    if (new BigNumber(price).gt(0) && new BigNumber(amount).gt(0) && selectedPair && isCombineOB(selectedMethods)) {
      fetchSORData();
    }

    return () => {
      clearTimeout(debounceTimeout.current);
    };
  }, [price, amount, selectedPair, selectedMethods, behaviour, balanceStellar, balanceBsc, sorType]);

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
          {/*behaviour*/}
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
          {/* info*/}
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
                    {/*{formatBalance(balanceBsc) || '0.0000000'}{' '}*/}
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
              id={'price-input'}
              className={cx('input')}
              value={!!(price || price === '0') ? price : ''}
              onWheel={disableNumberInputScroll}
              onKeyPress={disableInvalidCharacters}
              onKeyUp={disableNumberInputUpDown}
              onKeyDown={disableNumberInputUpDown}
              onChange={handleChangePrice}
              onBlur={handleOnBlurPrice}
              type={'number'}
              inputProps={{ form: 'novalidatedform' }}
              startAdornment={
                <label htmlFor={'price-input'} className={cx('placeholder-left', 'text-cursor')}>
                  Price
                </label>
              }
              endAdornment={
                <label htmlFor={'price-input'} className={cx('placeholder-right', 'text-cursor')}>
                  {selectedPair?.quote_symbol}
                </label>
              }
            />
            <InputBase
              id={'amount-input'}
              className={cx(
                'input',
                ((maxAmountTotal && behaviour === Behaviour.SELL) || openMinAmountErrorMessage) &&
                  isConnected(wallet) &&
                  'error-border',
              )}
              value={!!(amount || amount === '0') ? amount : ''}
              onWheel={disableNumberInputScroll}
              onKeyPress={disableInvalidCharacters}
              onKeyUp={disableNumberInputUpDown}
              onKeyDown={disableNumberInputUpDown}
              onChange={handleChangeAmount}
              onBlur={() => {
                handleOnBlurAmount();
                validMaxAmountTotal();
                validMinAmount();
              }}
              type={'number'}
              inputProps={{ form: 'novalidatedform' }}
              startAdornment={
                <label htmlFor={'amount-input'} className={cx('placeholder-left', 'text-cursor')}>
                  Amount
                </label>
              }
              endAdornment={
                <label htmlFor={'amount-input'} className={cx('placeholder-right', 'text-cursor')}>
                  {selectedPair?.base_symbol}
                </label>
              }
            />
            {maxAmountTotal && behaviour === Behaviour.SELL && isConnected(wallet) && (
              <div className={cx('error-text')}>
                Max amount: {maxAmountTotal || '-'} {' ' + selectedPair?.base_symbol}
              </div>
            )}
            {openMinAmountErrorMessage && isConnected(wallet) && (
              <div className={cx('error-text')}>Amount can not be smaller than {minAmount}</div>
            )}
            <InputBase
              id={'total-input'}
              className={cx(
                'input',
                ((maxAmountTotal && behaviour === Behaviour.BUY) || openMinTotalErrorMessage) &&
                  isConnected(wallet) &&
                  'error-border',
              )}
              value={!!(total || total === '0') ? total : ''}
              onScroll={disableNumberInputScroll}
              onKeyPress={disableInvalidCharacters}
              onKeyUp={disableNumberInputUpDown}
              onKeyDown={disableNumberInputUpDown}
              onChange={handleChangeTotal}
              onBlur={() => {
                handleOnBlurTotal();
                validMaxAmountTotal();
                validMinTotal();
              }}
              type={'number'}
              inputProps={{ form: 'novalidatedform' }}
              startAdornment={
                <label htmlFor={'total-input'} className={cx('placeholder-left', 'text-cursor')}>
                  Total
                </label>
              }
              endAdornment={
                <label htmlFor={'total-input'} className={cx('placeholder-right', 'text-cursor')}>
                  {selectedPair?.quote_symbol}
                </label>
              }
            />
            {maxAmountTotal && behaviour === Behaviour.BUY && isConnected(wallet) && (
              <div className={cx('error-text')}>
                Max total: {maxAmountTotal || '-'} {' ' + selectedPair?.quote_symbol}
              </div>
            )}
            {openMinTotalErrorMessage && isConnected(wallet) && (
              <div className={cx('error-text')}>Total can not be smaller than {minTotal}</div>
            )}

            <Select2
              options={isSingleBscOB(selectedMethods) ? durationOptions : [durationOptions[1]]}
              option={durationOption}
              isFloating={false}
              onClick={handleDurationOption}
              endAdornment={<ArrowDownOutline />}
              className={cx('select-duration')}
            />

            {/* TrustLine*/}
            {/*{isSingleStellarOB(selectedMethods) && <TrustLine />}*/}

            {/*SOR Price*/}
            {isSOR(selectedMethods) && <SORPrice price={sorData.price} />}

            {/* View order routing*/}
            {isSOR(selectedMethods) && <ViewOrderRouting />}
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
          orderType: EORDER_TYPE.Limit,
          price,
          amount,
          total,
          duration: durationOption.value,
        }}
      />
    </>
  );
};

export default LimitOrder;
