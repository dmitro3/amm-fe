/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { Source } from 'src/features/SOR/constances/source';
import { getSOR } from 'src/features/SOR/helpers/sor';
import { NetworkData, QueryParam, SORData } from 'src/features/SOR/interfaces';
import { OrderSide } from 'src/features/User/Account/misc';
import { qsStringRemoveFalsy } from 'src/features/User/Account/misc/helper';

export const getSORdata = createAsyncThunk('sor/getSOR', async (p: QueryParam, { rejectWithValue }) => {
  const body = {
    buyToken: p.buyToken,
    sellToken: p.sellToken,
    amount: p.amount ? p.amount : undefined,
    buyAmount: p.buyAmount ? p.buyAmount : p.behaviour === Behaviour.BUY ? p.amount : undefined,
    sellAmount: p.sellAmount ? p.sellAmount : p.behaviour === Behaviour.SELL ? p.amount : undefined,
    xlmFeeRate: p.xlmFeeRate,
    fcxFeeRate: p.fcxFeeRate,
    xlmSellTokenBalance:
      new BigNumber(p.xlmSellTokenBalance || '').gte(0) && p.sorType === SORType.USER_SOR
        ? new BigNumber(p.xlmSellTokenBalance || '0').dp(0).toString()
        : undefined,
    bscSellTokenBalance:
      new BigNumber(p.bscSellTokenBalance || '').gte(0) && p.sorType === SORType.USER_SOR
        ? p.bscSellTokenBalance
        : undefined,
    includedSources: p.includedSources.reduce(
      (previousValue: Source, currentValue: Source): any => previousValue + ',' + currentValue,
    ),
    ...(p.slippagePercentage && { slippagePercentage: p.slippagePercentage }),
  };

  const sorData = await axios
    .get(`${process.env.REACT_APP_BASE_SOR}/swap/v1/quote`, {
      params: qsStringRemoveFalsy(body),
    })
    .then((r) => r.data)
    .catch((e) => {
      throw rejectWithValue(e.response);
    });

  return {
    data: sorData,
    behaviour: p.behaviour,
    pricePrecision: p.pricePrecision,
    amountPrecision: p.amountPrecision,
    decimal: p.decimal,
    includedSources: p.includedSources,
    behaviourWithPair: p.behaviourWithPair,
  };
});

const initialState: SORData = {
  isLoadingSORData: false,
  averagePrice: '0',
  price: '0',
  stellarOB: {
    source: Source.StellarOBSource,
    amount: '0',
    proportion: '0',
  },
  bscOB: {
    source: Source.BscOBSource,
    amount: '0',
    proportion: '0',
  },
  bscLP: {
    source: Source.BscLPSource,
    amount: '0',
    proportion: '0',
  },
  pancakeswapLP: {
    source: Source.PancakeswapLPSource,
    amount: '0',
    proportion: '0',
  },
};

export const sorSlice = createSlice({
  name: 'sor',
  initialState,
  reducers: {
    setIsLoadingSORData: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSORData = action.payload;
    },
    updateLimitSORData: (state, action) => {
      try {
        const { data, side, price, amount, amountPrecision } = action.payload;
        const newData: NetworkData[] = [];

        for (let i = 0; i < data.length; i++) {
          newData.push({
            orderbook: JSON.parse(JSON.stringify(data[i].orderbook)),
            balance: JSON.parse(JSON.stringify(data[i].balance)),
            name: JSON.parse(JSON.stringify(data[i].name)),
          });

          const fee = data[i].fee;
          newData[i].orderbook.bids = newData[i].orderbook.bids.map((i: any) => {
            return {
              ...i,
              amount: new BigNumber(i.amount).div(new BigNumber(1).minus(fee)).toFixed(7),
            };
          });
          newData[i].orderbook.asks = newData[i].orderbook.asks.map((i: any) => {
            return {
              ...i,
              amount: new BigNumber(i.amount).div(new BigNumber(1).minus(fee)).toFixed(7),
            };
          });
        }

        const result = getSOR(newData, side, price, amount, amountPrecision);
        // set price
        state.price = result.price;

        // case XLM (StellarOB)
        let totalXLMAmount = new BigNumber('0');
        state.stellarOB.proportion =
          result.sources.find((item: any) => item.name === Source.StellarOBSource)?.proportion || '0';
        const xlmOrders: Array<any> = result.orders.filter((item: any) => item.source === Source.StellarOBSource);
        for (const xlmOrder of xlmOrders) {
          totalXLMAmount = totalXLMAmount.plus(side === OrderSide.Sell ? xlmOrder.makerAmount : xlmOrder.takerAmount);
        }
        state.stellarOB.amount = totalXLMAmount.toString();

        // case FCX (BscOB)
        let totalFCXAmount = new BigNumber('0');
        state.bscOB.proportion =
          result.sources.find((item: any) => item.name === Source.BscOBSource)?.proportion || '0';
        const fcxOrders: Array<any> = result.orders.filter((item: any) => item.source === Source.BscOBSource);
        for (const fcxOrder of fcxOrders) {
          totalFCXAmount = totalFCXAmount.plus(side === OrderSide.Sell ? fcxOrder.makerAmount : fcxOrder.takerAmount);
        }
        state.bscOB.amount = totalFCXAmount.toString();

        // case Balancer (BscLP)
        let totalBalancerAmount = new BigNumber('0');
        state.bscLP.proportion =
          result.sources.find((item: any) => item.name === Source.BscLPSource)?.proportion || '0';
        const balancerOrders: Array<any> = result.orders.filter((item: any) => item.source === Source.BscLPSource);
        for (const balancerOrder of balancerOrders) {
          totalBalancerAmount = totalBalancerAmount.plus(
            side === OrderSide.Sell ? balancerOrder.makerAmount : balancerOrder.takerAmount,
          );
        }
        state.bscLP.amount = totalBalancerAmount.toString();
      } catch (e) {
        state.isLoadingSORData = initialState.isLoadingSORData;
        state.averagePrice = initialState.averagePrice;
        state.price = initialState.price;
        state.stellarOB = initialState.stellarOB;
        state.bscOB = initialState.bscOB;
        state.bscLP = initialState.bscLP;
      } finally {
        state.isLoadingSORData = false;
      }
    },
    clearSorData: (state) => {
      state.isLoadingSORData = initialState.isLoadingSORData;
      state.averagePrice = initialState.averagePrice;
      state.price = initialState.price;
      state.stellarOB = initialState.stellarOB;
      state.bscOB = initialState.bscOB;
      state.bscLP = initialState.bscLP;
    },
  },
  extraReducers: {
    [`${getSORdata.pending}`]: (state) => {
      state.isLoadingSORData = true;
    },
    [`${getSORdata.rejected}`]: (state, action) => {
      state.isLoadingSORData = initialState.isLoadingSORData;
      state.averagePrice = initialState.averagePrice;
      state.price = initialState.price;
      state.stellarOB = initialState.stellarOB;
      state.bscOB = initialState.bscOB;
      state.bscLP = initialState.bscLP;
    },
    [`${getSORdata.fulfilled}`]: (state, action) => {
      state.isLoadingSORData = initialState.isLoadingSORData;
      try {
        const data = action.payload.data;
        const behaviour = action.payload.behaviour;
        const pricePrecision = action.payload.pricePrecision;
        const amountPrecision = action.payload.amountPrecision;
        const decimal = action.payload.decimal;
        const includedSources = action.payload.includedSources;
        const behaviourWithPair = action.payload.behaviourWithPair;

        // set price
        state.averagePrice = new BigNumber(data.price).dp(pricePrecision).toString();
        const price = {
          bids: new BigNumber(data.orders[0].baseQuotePrice || data.price),
          asks: new BigNumber(data.orders[0].baseQuotePrice || data.price),
        };

        // case XLM (StellarOB)
        let totalXLMAmount = new BigNumber('0');
        state.stellarOB.proportion =
          data.sources.find((item: any) => item.name === Source.StellarOBSource)?.proportion || '0';
        const xlmOrders: Array<any> = data.orders.filter((item: any) => item.source === Source.StellarOBSource);
        for (const xlmOrder of xlmOrders) {
          totalXLMAmount = totalXLMAmount.plus(
            behaviour === Behaviour.BUY ? xlmOrder.makerAmount : xlmOrder.takerAmount,
          );

          if (price.bids.lt(xlmOrder.baseQuotePrice)) {
            price.bids = new BigNumber(xlmOrder.baseQuotePrice);
          } else if (price.asks.gt(xlmOrder.baseQuotePrice)) {
            price.asks = new BigNumber(xlmOrder.baseQuotePrice);
          }
        }
        totalXLMAmount = totalXLMAmount.div(new BigNumber(10).pow(decimal));
        if (amountPrecision >= 0) {
          totalXLMAmount = new BigNumber(totalXLMAmount.dp(amountPrecision));
        }
        state.stellarOB.amount = totalXLMAmount.toString();

        // case FCX (BscOB)
        let totalFCXAmount = new BigNumber('0');
        state.bscOB.proportion = data.sources.find((item: any) => item.name === Source.BscOBSource)?.proportion || '0';
        const fcxOrders: Array<any> = data.orders.filter((item: any) => item.source === Source.BscOBSource);
        for (const fcxOrder of fcxOrders) {
          totalFCXAmount = totalFCXAmount.plus(
            behaviour === Behaviour.BUY ? fcxOrder.makerAmount : fcxOrder.takerAmount,
          );

          if (price.bids.lt(fcxOrder.baseQuotePrice)) {
            price.bids = new BigNumber(fcxOrder.baseQuotePrice);
          } else if (price.asks.gt(fcxOrder.baseQuotePrice)) {
            price.asks = new BigNumber(fcxOrder.baseQuotePrice);
          }
        }
        totalFCXAmount = totalFCXAmount.div(new BigNumber(10).pow(decimal));
        if (amountPrecision >= 0) {
          totalFCXAmount = new BigNumber(totalFCXAmount.dp(amountPrecision));
        }
        state.bscOB.amount = totalFCXAmount.toString();

        // case Balancer (BscLP)
        // let currentBscLPSource: Source;
        // if (includedSources.find((s: Source) => s === Source.BscLPSourceAdmin)) {
        //   currentBscLPSource = Source.BscLPSourceAdmin;
        // } else if (includedSources.find((s: Source) => s === Source.BscLPSourceRestricted)) {
        //   currentBscLPSource = Source.BscLPSourceRestricted;
        // } else if (includedSources.find((s: Source) => s === Source.BscLPSourceUnrestricted)) {
        // } else {
        //   currentBscLPSource = Source.BscLPSource;
        // }
        let currentBscLPSource: Source = Source.BscLPSource;
        const isMultihop = Number(
          data.sources.find((item: any) => item.name === Source.BscLPSourceMultiHop)?.proportion || '0',
        );
        if (isMultihop) {
          currentBscLPSource = Source.BscLPSourceMultiHop;
        }

        state.bscLP.source = currentBscLPSource;

        let totalBalancerAmount = new BigNumber('0');
        state.bscLP.proportion = data.sources.find((item: any) => item.name === currentBscLPSource)?.proportion || '0';
        let balancerOrders: Array<any> = [];
        if (!isMultihop) {
          balancerOrders = data.orders.filter((item: any) => item.source === currentBscLPSource);
        } else {
          balancerOrders = data.orders.slice(0, 1);
        }
        for (const balancerOrder of balancerOrders) {
          totalBalancerAmount = totalBalancerAmount.plus(
            behaviour === Behaviour.BUY ? balancerOrder.makerAmount : balancerOrder.takerAmount,
          );
        }
        totalBalancerAmount = totalBalancerAmount.div(new BigNumber(10).pow(decimal));
        if (amountPrecision >= 0) {
          totalBalancerAmount = new BigNumber(totalBalancerAmount.dp(amountPrecision));
        }
        state.bscLP.amount = totalBalancerAmount.toString();

        state.price = new BigNumber(behaviourWithPair === Behaviour.BUY ? price.asks : price.bids)
          .dp(pricePrecision)
          .toString();

        state.pancakeswapLP.source = Source.PancakeswapLPSource;

        let totalPancakeswapAmount = new BigNumber('0');
        state.pancakeswapLP.proportion =
          data.sources.find((item: any) => item.name === Source.PancakeswapLPSource)?.proportion || '0';
        let pancakeswapOrder: Array<any> = [];
        if (!isMultihop) {
          pancakeswapOrder = data.orders.filter((item: any) => item.source === Source.PancakeswapLPSource);
        } else {
          pancakeswapOrder = data.orders.slice(0, 1);
        }
        for (const balancerOrder of pancakeswapOrder) {
          totalPancakeswapAmount = totalPancakeswapAmount.plus(
            behaviour === Behaviour.BUY ? balancerOrder.makerAmount : balancerOrder.takerAmount,
          );
        }
        totalPancakeswapAmount = totalPancakeswapAmount.div(new BigNumber(10).pow(decimal));
        if (amountPrecision >= 0) {
          totalPancakeswapAmount = new BigNumber(totalPancakeswapAmount.dp(amountPrecision));
        }
        state.pancakeswapLP.amount = totalPancakeswapAmount.toString();

        state.price = new BigNumber(behaviourWithPair === Behaviour.BUY ? price.asks : price.bids)
          .dp(pricePrecision)
          .toString();
      } catch (e) {
        state.isLoadingSORData = initialState.isLoadingSORData;
        state.averagePrice = initialState.averagePrice;
        state.price = initialState.price;
        state.stellarOB = initialState.stellarOB;
        state.bscOB = initialState.bscOB;
        state.bscLP = initialState.bscLP;
      } finally {
        state.isLoadingSORData = false;
      }
    },
  },
});

export const { setIsLoadingSORData, updateLimitSORData, clearSorData } = sorSlice.actions;

const { reducer: sorReducer } = sorSlice;

export default sorReducer;
