/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Typography } from '@material-ui/core';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { bscIcon, combineOBIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';
import { TradingMethod } from 'src/constants/dashboard';
import {
  ceil10,
  floor10,
  formatData,
  groupByCount,
  orderbookSelector,
  sortPrice,
} from 'src/features/Orderbook/helpers/orderbookHelper';
import { OrderbookRow } from 'src/features/Orderbook/interfaces/orderbook';
import {
  isContainBscLB,
  isContainBscOB,
  isContainPancakeswapLB,
  isContainStellarOB,
} from 'src/features/OrderForm/helpers/network/checkNetwork';
import { displayData } from 'src/features/Pairs/helper';
import { Pair, PairInfo } from 'src/features/Pairs/interfaces/pair';
import { setSelectedPair } from 'src/features/Pairs/redux/pair';
import { formatCurrencyAmount } from 'src/features/PoolsInfo/helpers/dataFormatter';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { currencySelector } from 'src/helpers/functional-currency';
import { getIconPairSelectByNetwork, isCombineOB } from 'src/helpers/getIconPairSelected';
import { returnAmountBidAsk } from 'src/helpers/pair';
// import { checkWhitelistStellar } from 'src/features/ConnectWallet/service';
// import { setWhiteList } from 'src/features/ConnectWallet/redux/wallet';
import { getPublicKeyFromPrivateKey } from 'src/helpers/stellarHelper/address';
import { THEME_MODE } from 'src/interfaces/theme';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from '../styles/Pairs.module.scss';
import PairModal from './PairModal';

const cx = classnames.bind(styles);

interface IPairStatistic {
  network: number;
}

export const TO_FIX_2 = '0.01';

export const getClassNamePrice = (result: number | undefined): string => {
  if (result === 0 || !result) {
    return 'price-eq';
  }
  if (result > 0) {
    return 'price-gt';
  }
  return 'price-lt';
};

const PairStatistic: React.FC<IPairStatistic> = (props) => {
  const dispatch = useAppDispatch();

  const [refElm, setRefEml] = useState<HTMLButtonElement | null>(null);
  const pairs = useAppSelector((state) => state.allPairs.pairs.data);
  const pairInfos = useAppSelector((state) => state.pair.pairInfos);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const wallet = useAppSelector((state) => state.wallet);
  const [selectedPairInfo, setSelectedPairInfo] = useState<PairInfo>();
  const orderBook: any = useAppSelector(orderbookSelector);
  const selectedMethods = useAppSelector((state) => state.trading.selectedMethods);
  const exchangeRates = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency = useAppSelector(currencySelector);
  const [bids, setBids] = useState<OrderbookRow>();
  const [asks, setAsks] = useState<OrderbookRow>();

  const theme = useAppSelector((state) => state.theme.themeMode);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkingWhiteListStellar = async (address: string, selectedPair: Pair) => {
    // const res = await checkWhitelistStellar(address, selectedPair);
    // dispatch(setWhiteList(res));
  };
  const onSelectPairId = (pairs_id: number) => {
    if (pairs) {
      const pair = pairs.find((pair: Pair) => pair.pairs_id === pairs_id);
      if (pair) {
        dispatch(setSelectedPair(pair));
        if (wallet.freighter) {
          checkingWhiteListStellar(wallet.freighter, pair);
        }
        if (wallet.ledger.publicKey) {
          checkingWhiteListStellar(wallet.ledger.publicKey, pair);
        }
        if (wallet.trezor.publicKey) {
          checkingWhiteListStellar(wallet.trezor.publicKey, pair);
        }
        if (wallet.privateKey) {
          checkingWhiteListStellar(getPublicKeyFromPrivateKey(wallet.privateKey), pair);
        }
      }
    }
  };

  const getIconTickerByTradingNetwork = (lastTradeMethod?: TradingMethod) => {
    switch (lastTradeMethod) {
      case TradingMethod.StellarOrderbook:
        return theme === THEME_MODE.LIGHT ? StellarOrderBookLightIcon : StellarOrderBookDarkIcon;
      case TradingMethod.BSCOrderbook || TradingMethod.BSCPool:
        return bscIcon;
      case TradingMethod.CombinedOrderbook:
        return combineOBIcon;
      default:
        break;
    }
  };

  const mergePairBar = () => {
    // when contain Pancake LP and at least 1 OB then merge the bar of LP into the bar of OB
    const condition1 =
      isContainPancakeswapLB(selectedMethods) &&
      (isContainBscOB(selectedMethods) || isContainStellarOB(selectedMethods)) &&
      !isContainBscLB(selectedMethods);

    return condition1;
  };

  useEffect(() => {
    const priceLog10 = Math.log10(Number(selectedPair?.price_precision) || 1).toString();
    let bids = formatData(orderBook.bids);
    bids = sortPrice(groupByCount(floor10(bids, priceLog10 || '0.1')), '-');
    let asks = formatData(orderBook.asks);
    asks = sortPrice(groupByCount(ceil10(asks, priceLog10 || '0.1')), '+');
    setBids(bids[0]);
    setAsks(asks[0]);
  }, [orderBook]);

  useEffect(() => {
    if (selectedPair && pairInfos) {
      const selectedPairInfo = pairInfos.find(
        (pair: PairInfo) => pair.pair_id === selectedPair.pairs_id && props.network === pair.method,
      );
      selectedPairInfo && setSelectedPairInfo(selectedPairInfo);
    }
  }, [selectedPair, pairInfos, props]);

  return (
    <>
      {props.network === TradingMethod.BSCPool &&
      isContainPancakeswapLB(selectedMethods) &&
      !isContainBscLB(selectedMethods) ? (
        mergePairBar() ? (
          <></>
        ) : (
          <div className={cx('pair-statistic')}>
            <div className={cx('pair-statistic-left')}>
              <div className={cx('select-pair')}>
                <div className={cx('image-wallet-wrapper')}>
                  <img src={getIconPairSelectByNetwork(props.network, selectedMethods, theme)} />
                </div>
                <Button
                  endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                  className={cx('button')}
                  focusRipple={false}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setRefEml(event.currentTarget)}
                >
                  <Typography className={cx('pair-name')}>
                    {selectedPair ? selectedPair.base_symbol + '/' + selectedPair.quote_symbol : ''}
                  </Typography>
                </Button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className={cx('pair-statistic')}>
          <div className={cx('pair-statistic-left')}>
            <div className={cx('select-pair')}>
              <div className={cx('image-wallet-wrapper')}>
                <img src={getIconPairSelectByNetwork(props.network, selectedMethods, theme)} />
              </div>
              <Button
                endIcon={<ArrowDropDownRoundedIcon className={cx('arrow-icon')} />}
                className={cx('button')}
                focusRipple={false}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => setRefEml(event.currentTarget)}
              >
                <Typography className={cx('pair-name')}>
                  {selectedPair ? selectedPair.base_symbol + '/' + selectedPair.quote_symbol : ''}
                </Typography>
              </Button>
            </div>
            {props.network !== TradingMethod.BSCPool && (
              <div className={cx('item-lastPrice')}>
                {isCombineOB(selectedMethods, props.network) && (
                  <img src={getIconTickerByTradingNetwork(selectedPairInfo?.last_trading_method)} />
                )}
                <div className={cx('last-price', getClassNamePrice(Number(selectedPairInfo?.last_price_changed)))}>
                  {displayData(selectedPairInfo?.last_price, selectedPair?.price_precision)}
                </div>
              </div>
            )}
            {props.network === TradingMethod.BSCPool && (
              <div className={cx('item-lastPrice-percent')}>
                {isCombineOB(selectedMethods, props.network) && (
                  <img src={getIconTickerByTradingNetwork(selectedPairInfo?.last_trading_method)} />
                )}
                <div className={cx('last-price-liq', getClassNamePrice(Number(selectedPairInfo?.last_price_changed)))}>
                  {displayData(selectedPairInfo?.last_price, selectedPair?.price_precision)}
                </div>

                <span className={cx(getClassNamePrice(selectedPairInfo?.price_change_percent), 'price-change-percent')}>
                  {selectedPairInfo?.price_change_percent
                    ? `${fixPrecision(selectedPairInfo?.price_change_percent, TO_FIX_2)}%`
                    : '-'}
                </span>
              </div>
            )}
          </div>
          <div className={cx('pair-statistic-right')}>
            {props.network !== TradingMethod.BSCPool && (
              <div className={cx('sub-block')}>
                <div className={cx('item-ticker')}>
                  {isCombineOB(selectedMethods, props.network) && (
                    <img src={getIconTickerByTradingNetwork(selectedPairInfo?.last_trading_method)} />
                  )}
                  <div className={cx('label')}>24h Change</div>
                </div>
                <div className={cx('value', getClassNamePrice(selectedPairInfo?.price_change))}>
                  {displayData(selectedPairInfo?.price_change, selectedPair?.price_precision)}{' '}
                  <span className={cx(getClassNamePrice(selectedPairInfo?.price_change_percent))}>
                    {selectedPairInfo?.price_change_percent
                      ? `${selectedPairInfo?.price_change_percent > 0 ? '+' : ''}${fixPrecision(
                          selectedPairInfo?.price_change_percent,
                          TO_FIX_2,
                        )}%`
                      : '-'}
                  </span>
                </div>
              </div>
            )}
            {props.network === TradingMethod.BSCPool && (
              <div className={cx('sub-block')}>
                <div className={cx('label')}>Total liquidity</div>
                <div className={cx('value', getClassNamePrice(selectedPairInfo?.liquidity))}>
                  {formatCurrencyAmount(selectedPairInfo?.liquidity || '0', selectedCurrency, exchangeRates)}{' '}
                  <span className={cx(getClassNamePrice(selectedPairInfo?.liquidity_change_percent))}>
                    {selectedPairInfo?.liquidity_change_percent
                      ? `${selectedPairInfo?.liquidity_change_percent > 0 ? '+' : ''}${fixPrecision(
                          selectedPairInfo?.liquidity_change_percent,
                          TO_FIX_2,
                        )}%`
                      : '-'}
                  </span>
                </div>
              </div>
            )}
            <div className={cx('sub-block')}>
              <div className={cx('item-ticker')}>
                {isCombineOB(selectedMethods, props.network) && <img src={combineOBIcon} />}
                <div className={cx('label')}>24h Volume ({selectedPair?.base_symbol})</div>
              </div>
              <div className={cx('value')}>{displayData(selectedPairInfo?.volume, TO_FIX_2)}</div>
            </div>
            <div className={cx('sub-block')}>
              <div className={cx('item-ticker')}>
                {isCombineOB(selectedMethods, props.network) && <img src={combineOBIcon} />}
                <div className={cx('label')}>24h Volume ({selectedPair?.quote_symbol})</div>
              </div>
              <div className={cx('value')}>{displayData(selectedPairInfo?.quote_volume, TO_FIX_2)}</div>
            </div>

            <div className={cx('sub-block')}>
              <div className={cx('item-ticker')}>
                {isCombineOB(selectedMethods, props.network) && bids && (
                  <img src={getIconTickerByTradingNetwork(bids.method)} />
                )}
                <div className={cx('label')}>Bid price</div>
              </div>
              {props.network !== TradingMethod.BSCPool && (
                <div className={cx('bid-value')}>
                  {bids ? (
                    <>
                      {displayData(new BigNumber(bids.price).toNumber(), selectedPair?.price_precision)}{' '}
                      <span className={cx('value')}>
                        (
                        {returnAmountBidAsk(
                          displayData(new BigNumber(bids.amount).toNumber(), selectedPair?.amount_precision),
                          selectedPair?.amount_precision,
                        )}
                        )
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              )}
              {props.network === TradingMethod.BSCPool && (
                <div className={cx('bid-value')}>
                  {selectedPairInfo?.bid.price ? (
                    <>
                      {displayData(selectedPairInfo.bid.price, selectedPair?.price_precision)}{' '}
                      <span className={cx('value')}>
                        (
                        {returnAmountBidAsk(
                          displayData(selectedPairInfo.bid.amount, selectedPair?.amount_precision),
                          selectedPair?.amount_precision,
                        )}
                        )
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              )}
            </div>
            <div className={cx('sub-block')}>
              <div className={cx('item-ticker')}>
                {isCombineOB(selectedMethods, props.network) && asks && (
                  <img src={getIconTickerByTradingNetwork(asks.method)} />
                )}
                <div className={cx('label')}>Ask price</div>
              </div>
              {props.network !== TradingMethod.BSCPool && (
                <div className={cx('nev-value')}>
                  {asks ? (
                    <>
                      {displayData(new BigNumber(asks.price).toNumber(), selectedPair?.price_precision)}{' '}
                      <span className={cx('value')}>
                        (
                        {returnAmountBidAsk(
                          displayData(new BigNumber(asks.amount).toNumber(), selectedPair?.amount_precision),
                          selectedPair?.amount_precision,
                        )}
                        )
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              )}
              {props.network === TradingMethod.BSCPool && (
                <div className={cx('nev-value')}>
                  {selectedPairInfo?.ask.price ? (
                    <>
                      {displayData(selectedPairInfo?.ask.price, selectedPair?.price_precision)}{' '}
                      <span className={cx('value')}>
                        (
                        {returnAmountBidAsk(
                          displayData(selectedPairInfo?.ask.amount, selectedPair?.amount_precision),
                          selectedPair?.amount_precision,
                        )}
                        )
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PairModal
        open={Boolean(refElm)}
        handleClose={() => setRefEml(null)}
        refElm={refElm}
        pairs={pairs ? pairs : []}
        onSelectPairId={onSelectPairId}
        pairInfos={pairInfos}
        network={props.network}
      />
    </>
  );
};

export default PairStatistic;
