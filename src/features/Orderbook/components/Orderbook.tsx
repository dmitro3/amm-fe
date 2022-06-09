import BigNumber from 'bignumber.js';
import classNames from 'classnames/bind';
import React, { useCallback, useEffect, useState } from 'react';
import buy from 'src/assets/icon/BuyOrder.svg';
import all from 'src/assets/icon/Orderbook.svg';
import sell from 'src/assets/icon/SellOrder.svg';
import { ISelect } from 'src/components/Base/Select/Select';
import Select2 from 'src/components/Base/Select2';
import OrderBookStellarTable from 'src/features/Orderbook/components/OrderTable';
import {
  ORDER_BOOK_DISPLAY_BOTH,
  ORDER_BOOK_DISPLAY_BOTH_LENGTH,
  ORDER_BOOK_DISPLAY_BUY_ONLY,
  ORDER_BOOK_DISPLAY_BUY_SELL_ONLY_LENGTH,
  ORDER_BOOK_DISPLAY_SELL_ONLY,
} from 'src/features/Orderbook/constants/FomartDataValue';
import {
  ceil10,
  floor10,
  formatData,
  getConfigPair,
  getStellarAssetType,
  getTotal,
  getTotalPercent,
  groupByCount,
  orderbookSelector,
  setDataLength,
  setPrecision,
  sortPrice,
} from 'src/features/Orderbook/helpers/orderbookHelper';
import { OrderbookRow } from 'src/features/Orderbook/interfaces/orderbook';
import { clearOrderbook, getBscOrderbook, getStellarOrderbook } from 'src/features/Orderbook/redux/orderbook.slice';
import styles from 'src/features/Orderbook/stypes/OrderBookStellar.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import eventBus from 'src/event/event-bus';
import { SocketEvent } from 'src/socket/SocketEvent';
import LastPrice from './LastPrice';

const cx = classNames.bind(styles);
const Orderbook: React.FC = () => {
  const dispatch = useAppDispatch();
  const orderbook: any = useAppSelector(orderbookSelector);

  const [displayMode, setDisplayMode] = useState(0);
  const selectedPair: any = useAppSelector((state) => state.pair.selectedPair);
  const [bids, setBids] = useState(new Array<OrderbookRow>());
  const [asks, setAsks] = useState(new Array<OrderbookRow>());
  const [pricePrecision, setPricePrecision] = useState('0.0001');
  const [groupCount, setGroupCount] = useState(4);
  const [selectedGroup, setSelectedGroup] = useState({
    value: '-4',
    label: '0.0001',
  });

  const fetchStellarOrderbook = useCallback(async () => {
    if (selectedPair) {
      const base_type = getStellarAssetType(selectedPair.base_type);
      const quote_type = getStellarAssetType(selectedPair.quote_type);
      const params = {
        selling_asset_type: `${base_type}`,
        selling_asset_code: `${selectedPair.base_symbol}`,
        selling_asset_issuer: `${selectedPair.base_stellar_issuer}`,
        buying_asset_type: `${quote_type}`,
        buying_asset_code: `${selectedPair.quote_symbol}`,
        buying_asset_issuer: `${selectedPair.quote_stellar_issuer}`,
        limit: 200,
      };
      dispatch(getStellarOrderbook(params));
    }
  }, [selectedPair?.pairs_id]);

  useEffect(() => {
    const amountLog10 = Math.log10(selectedPair?.amount_precision || 1) - 2;
    let bids = formatData(orderbook.bids);
    bids = sortPrice(groupByCount(floor10(bids, selectedGroup.value)), '-');
    let asks = formatData(orderbook.asks);
    asks = sortPrice(groupByCount(ceil10(asks, selectedGroup.value)), '+');

    let bidCount: number;
    let askCount: number;
    if (displayMode === ORDER_BOOK_DISPLAY_BOTH) {
      bidCount = ORDER_BOOK_DISPLAY_BOTH_LENGTH;
      askCount = ORDER_BOOK_DISPLAY_BOTH_LENGTH;
    } else if (displayMode === ORDER_BOOK_DISPLAY_BUY_ONLY) {
      bidCount = ORDER_BOOK_DISPLAY_BUY_SELL_ONLY_LENGTH;
      askCount = 0;
    } else {
      bidCount = 0;
      askCount = ORDER_BOOK_DISPLAY_BUY_SELL_ONLY_LENGTH;
    }
    bids = bids.slice(0, bidCount);
    asks = asks.slice(0, askCount);
    bids = getTotal(bids);
    asks = getTotal(asks);
    bids = setPrecision(bids, selectedGroup.value, amountLog10);
    asks = setPrecision(asks, selectedGroup.value, amountLog10);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const maxBidTotal = bids.length > 0 ? bids[bids.length - 1].total! : 0;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const maxAskTotal = asks.length > 0 ? asks[asks.length - 1].total! : 0;
    const maxTotal = BigNumber.max(new BigNumber(maxBidTotal), new BigNumber(maxAskTotal)).toString();
    bids = getTotalPercent(bids, maxTotal);
    asks = getTotalPercent(asks, maxTotal);
    bids = setDataLength(bids, bidCount);
    asks = setDataLength(asks, askCount);
    asks = asks.reverse();
    setAsks(asks);
    setBids(bids);
  }, [orderbook, displayMode, selectedGroup]);

  useEffect(() => {
    dispatch(clearOrderbook());
    if (!selectedPair) {
      return;
    }

    setPricePrecision(selectedPair.price_precision);
    setGroupCount(selectedPair.group_count);
    setSelectedGroup(getConfigPair(selectedPair.price_precision, selectedPair.group_count)[0]);
    dispatch(getBscOrderbook({ pair_id: selectedPair.pairs_id }));
    fetchStellarOrderbook().then(() => {});
  }, [selectedPair?.pairs_id]);

  useEffect(() => {
    eventBus.remove(SocketEvent.StellarOrderbookUpdated);
    eventBus.on(SocketEvent.StellarOrderbookUpdated, fetchStellarOrderbook);
  }, [selectedPair?.pairs_id]);

  const handleOption = (option: React.SetStateAction<number>) => {
    setDisplayMode(option);
  };
  const handleOnClickOption = (value: ISelect): void => {
    setSelectedGroup(value);
  };
  return (
    <div className={cx('Orderbook')}>
      <div className={cx('button-container')}>
        <div>
          <button
            onClick={() => handleOption(0)}
            className={cx('button', displayMode === ORDER_BOOK_DISPLAY_BOTH ? 'active' : 'not-active')}
          >
            <img src={all} alt="all" />
          </button>
          <button
            onClick={() => handleOption(1)}
            className={cx('button', displayMode === ORDER_BOOK_DISPLAY_BUY_ONLY ? 'active' : 'not-active')}
          >
            <img src={buy} alt="buy" />
          </button>
          <button
            onClick={() => handleOption(2)}
            className={cx('button', displayMode === ORDER_BOOK_DISPLAY_SELL_ONLY ? 'active' : 'not-active')}
          >
            <img src={sell} alt="sell" />
          </button>
        </div>
        <Select2
          options={getConfigPair(pricePrecision, groupCount)}
          option={selectedGroup}
          onClick={handleOnClickOption}
        />
      </div>
      <div style={{ padding: 6 }}>
        {displayMode === ORDER_BOOK_DISPLAY_BOTH ? (
          <div>
            <OrderBookStellarTable
              color="red"
              textColor="#FF3B3B"
              thead={[
                `Price (${selectedPair?.quote_symbol || '--'})`,
                `Amount (${selectedPair?.base_symbol || '--'})`,
                'Total',
              ]}
              tbody={asks}
            />
            <LastPrice />
            <OrderBookStellarTable color="#06C270" textColor="#06C270" tbody={bids} />
          </div>
        ) : displayMode === ORDER_BOOK_DISPLAY_BUY_ONLY ? (
          <div>
            <OrderBookStellarTable
              thead={[
                `Price (${selectedPair?.quote_symbol || '--'})`,
                `Amount (${selectedPair?.base_symbol || '--'})`,
                'Total',
              ]}
              color="#06C270"
              textColor="#06C270"
              tbody={bids}
            />
          </div>
        ) : (
          <div>
            <OrderBookStellarTable
              color="red"
              textColor="#FF3B3B"
              thead={[
                `Price (${selectedPair?.quote_symbol || '--'})`,
                `Amount (${selectedPair?.base_symbol || '--'})`,
                'Total',
              ]}
              tbody={asks}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orderbook;
