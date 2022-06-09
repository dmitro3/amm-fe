/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { MARKET_TRADE_DATA_LENGTH } from 'src/features/MarketTrade/constants/MarketTradeData';
import CMarketTrade from 'src/features/MarketTrade/components/MarketTradeTable';
import { fixPrecision } from 'src/helpers/fixPrecision';
import styles from 'src/features/MarketTrade/styles/MarketTrade.module.scss';
import classnames from 'classnames/bind';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  getStellarTradesApi,
  clearMarketTrade,
  getBSCTradesApi,
} from 'src/features/MarketTrade/redux/MarketTrade.slice';
import { BaseSocket } from 'src/socket/BaseSocket';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { tradesSelector } from 'src/features/MarketTrade/helper';
const cx = classnames.bind(styles);
export const MarketTrade: React.FC = () => {
  interface IMarketTrade {
    buyer_is_taker: boolean;
    price: string;
    filled_amount: string;
    created_at: string;
  }
  const selectedPair: Pair | undefined = useAppSelector((state) => state.pair.selectedPair);
  const trades: any = useAppSelector(tradesSelector);
  const dispatch = useAppDispatch();
  const setDefaultData = () => {
    const defaultData: IMarketTrade[] = [];
    for (let i = 0; i < MARKET_TRADE_DATA_LENGTH; i++) {
      defaultData.push({
        buyer_is_taker: true,
        price: '--',
        filled_amount: '--',
        created_at: '--',
      });
    }
    return defaultData;
  };
  const [marketTrade, setMarketTrade] = useState<IMarketTrade[]>([]);
  const [pricePrecision, setPricePrecision] = useState<string>('0.0001');
  const fetchListMarketTrade = async () => {
    if (selectedPair) {
      dispatch(getStellarTradesApi(selectedPair.pairs_id));
      dispatch(getBSCTradesApi(selectedPair.pairs_id));
    }
  };

  useEffect(() => {
    dispatch(clearMarketTrade());
    if (selectedPair) {
      setPricePrecision(selectedPair.price_precision);
    }
    fetchListMarketTrade().then(() => {
      BaseSocket.getInstance().listenPairEvents(selectedPair);
    });
  }, [selectedPair]);

  useEffect(() => {
    const formattedTrades = trades.map((marketTrade: any) => {
      return {
        ...marketTrade,
        price: fixPrecision(Number(marketTrade.price), pricePrecision),
        filled_amount: Number(marketTrade.filled_amount).toFixed(4),
      };
    });
    setMarketTrade(formattedTrades.concat(setDefaultData()).slice(0, MARKET_TRADE_DATA_LENGTH));
  }, [trades]);
  return (
    <div className={cx('marketTrade')}>
      <CMarketTrade
        thead={[
          `Price (${selectedPair?.quote_symbol ? selectedPair?.quote_symbol : '--'})`,
          `Amount(${selectedPair?.base_symbol ? selectedPair?.base_symbol : '--'})`,
          'Time',
        ]}
        tbody={marketTrade}
      />
    </div>
  );
};
export default MarketTrade;
