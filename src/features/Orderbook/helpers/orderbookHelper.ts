import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { TradingMethod } from 'src/constants/dashboard';
import { STELLAR_ASSET_TYPE } from 'src/features/Orderbook/constants/FomartDataValue';
import { OrderSide } from 'src/features/Orderbook/constants/orderbook';
import { clearBscOrderbook, getBscOrderbook, updateBscOrderbook } from 'src/features/Orderbook/redux/orderbook.slice';
import { RootState } from 'src/store/store';
import { Orderbook, OrderbookRow, OrderbookUpdate, OrderbookUpdates } from '../interfaces/orderbook';

const BigNum = (val: number) => {
  return new BigNumber(val);
};
export const formatData = (arr: OrderbookRow[]): OrderbookRow[] => {
  return arr?.map((order: OrderbookRow) => {
    return {
      price: order.price,
      amount: order.amount,
      method: order.method,
    };
  });
};
export const decimalAdjust = (type: string, value: string, exp: number): string => {
  // @ts-ignore
  value = Math[type](+(value + 'e' + -exp));
  return (+(value + 'e' + +exp)).toString();
};
export const sortPrice = (arr: OrderbookRow[], x: string): OrderbookRow[] => {
  return _.sortBy(arr, (item: { price: string }) => {
    return Number(`${x}` + item.price);
  });
};
export const floor10 = (array: OrderbookRow[], exp: string): OrderbookRow[] => {
  return array?.map((x) => {
    return {
      price: decimalAdjust('floor', x.price, parseInt(exp)),
      amount: x.amount,
      method: x.method,
    };
  });
};
export const ceil10 = (array: OrderbookRow[], exp: string): OrderbookRow[] => {
  return array?.map((x) => {
    return {
      price: decimalAdjust('ceil', x.price, parseInt(exp)),
      amount: x.amount,
      method: x.method,
    };
  });
};
// export const ceil5 = (array: any): { price: number; amount: string }[] => {
//   return array.map((x: { price: string; amount: string }) => {
//     const a = Number(x.price.split('.')[0]);
//     const b = decimalAdjust('floor', x.price, 2);
//     if (a - b > 50) {
//       return {
//         price: b + 100,
//         amount: x.amount,
//       };
//     }
//     return {
//       price: b + 50,
//       amount: x.amount,
//     };
//   });
// };
export const setPrecision = (arr: OrderbookRow[], priceExp: string, amountExp: number): OrderbookRow[] => {
  if (parseInt(priceExp) > 0) {
    priceExp = '0';
  }
  if (amountExp > 0) {
    amountExp = 0;
  }
  return arr.map((x: OrderbookRow) => {
    const amountFix = new BigNumber(x.amount).toFixed(-amountExp);
    const amountSub = '< ' + new BigNumber(10).pow(amountExp).toString();
    return {
      price: new BigNumber(x.price).toFixed(-parseInt(priceExp)),
      amount: Number(amountFix) > 0 ? amountFix : amountSub,
      method: x.method,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      total: new BigNumber(x.total!).toFixed(-amountExp),
    };
  });
};

const sumBigNums = (arr: OrderbookRow[]): string =>
  arr
    .map((item) => item.amount)
    .reduce((a: BigNumber, b: string) => {
      return a.plus(b);
    }, BigNum(0))
    .toString();

const getTradingMethod = (rows: OrderbookRow[]): TradingMethod =>
  rows.reduce((method: TradingMethod, row) => {
    return method | row.method;
  }, 0);

export const groupByCount = (array: OrderbookRow[]): OrderbookRow[] => {
  return _(array)
    .groupBy('price')
    .map(function (items: [], price: string) {
      const amount = sumBigNums(items);
      return {
        price,
        amount,
        method: getTradingMethod(items),
        total: amount,
      };
    })
    .value() as any as OrderbookRow[];
};
export const getConfigPair = (pricePrecision: string, groupCount: number): { value: string; label: string }[] => {
  const precision = pricePrecision?.split('.');
  if (!precision) {
    return [];
  }
  let lengthOfNum;
  if (precision[1]) {
    lengthOfNum = -precision[1].length;
  } else {
    lengthOfNum = precision[0].length;
  }
  const pairConfigOption: { value: string; label: string }[] = [];
  for (let i = 0; i < groupCount; i++) {
    pairConfigOption.push({
      value: (lengthOfNum + i).toString(),
      label: new BigNumber(10).pow(i).times(pricePrecision).toString(),
    });
  }
  return pairConfigOption;
};
export const getTotal = (arr: OrderbookRow[]): OrderbookRow[] => {
  let total = BigNum(0);
  return arr.map((item: any) => {
    total = total.plus(item.total);
    return {
      ...item,
      total: total.toString(),
    };
  });
};
export const setDataLength = (arr: OrderbookRow[], lengthOfArray: number): OrderbookRow[] => {
  while (arr.length < lengthOfArray) {
    arr.push({ price: '--', amount: '--', method: 0, total: '--', percent: '0' });
  }
  return arr;
};
export const getTotalPercent = (arr: OrderbookRow[], maxTotal: string): OrderbookRow[] => {
  return arr.map((item: any) => {
    return {
      ...item,
      percent: new BigNumber(item.total).times(100).div(maxTotal).toString(),
    };
  });
};

export const getStellarAssetType = (type: number): string => {
  return type === STELLAR_ASSET_TYPE.NATIVE
    ? 'native'
    : type === STELLAR_ASSET_TYPE.CREDIT_ALPHANUM4
    ? 'credit_alphanum4'
    : 'credit_alphanum12';
};

export const orderbookSelector = (state: RootState): Orderbook => {
  const selectedMethods = state.trading.selectedMethods;
  const usingStellar = selectedMethods.some((method) => method.key === TradingMethod.StellarOrderbook);
  const usingBsc = selectedMethods.some((method) => method.key === TradingMethod.BSCOrderbook);
  if (usingStellar && usingBsc) {
    return state.orderbook.combined.orderbook;
  } else if (usingStellar) {
    return state.orderbook.stellar.orderbook;
  } else if (usingBsc) {
    return state.orderbook.bsc.orderbook;
  } else {
    return { bids: [], asks: [] };
  }
};

export const getCombinedRows = (stellarRows: OrderbookRow[], bscRows: OrderbookRow[], asc: boolean): OrderbookRow[] => {
  return stellarRows.concat(bscRows).sort((row1, row2): number => {
    return asc ? new BigNumber(row1.price).comparedTo(row2.price) : new BigNumber(row2.price).comparedTo(row1.price);
  });
};

export const combineOrderbook = (stellarOrderbook: Orderbook, bscOrderbook: Orderbook): Orderbook => {
  const bids = getCombinedRows(stellarOrderbook?.bids, bscOrderbook?.bids, false);
  const asks = getCombinedRows(stellarOrderbook?.asks, bscOrderbook?.asks, true);
  return { bids, asks };
};

const findCurrentRow = (rows: OrderbookRow[], price: string, isBidRow: boolean): [number, OrderbookRow?] => {
  if (rows.length === 0) {
    return [-1, undefined];
  }

  const priceBN = new BigNumber(price);

  const bidCount = rows.length;
  for (let i = 0; i < bidCount; i++) {
    if (priceBN.comparedTo(rows[i].price) === 0) {
      return [i, rows[i]];
    }
    const isNewBidRow = isBidRow && priceBN.comparedTo(rows[i].price) > 0;
    const isNewAskRow = !isBidRow && priceBN.comparedTo(rows[i].price) < 0;
    if (isNewBidRow || isNewAskRow) {
      return [i, undefined];
    }
  }

  return [bidCount, undefined];
};

export const combineRow = (currentRow: OrderbookRow, newRow: OrderbookRow): OrderbookRow => {
  return {
    price: currentRow.price,
    amount: new BigNumber(currentRow.amount).plus(newRow.amount).toString(),
    method: currentRow.method | newRow.method,
  };
};

// eslint-disable-next-line
export const onReceiveBscUpdates = (store: any, data: any) => {
  const state = store.getState();
  const bscOrderbook = { ...state.orderbook.bsc };
  const newRow = data as OrderbookUpdates;
  if (bscOrderbook.isReady) {
    if (bscOrderbook.orderbook.updated_at === newRow.last_updated_at) {
      store.dispatch(updateBscOrderbook(data));
    } else {
      const selectedPair = state.pair.selectedPair;
      store.dispatch(clearBscOrderbook());
      store.dispatch(getBscOrderbook({ pair_id: selectedPair.pairs_id }));
    }
  } else {
    store.dispatch(updateBscOrderbook(data));
  }
};

export const applyBscUpdate = (orderbook: Orderbook, orderbookUpdate: OrderbookUpdate): void => {
  const newRow = { ...orderbookUpdate, method: TradingMethod.BSCOrderbook };
  const idBidRow = newRow.side === OrderSide.buy;
  const rows = idBidRow ? orderbook.bids : orderbook.asks;
  const [index, currentBid] = findCurrentRow(rows, newRow.price, idBidRow);
  if (!currentBid) {
    // add new row
    rows.splice(index, 0, newRow);
  } else {
    // update current row
    const updatedRow = combineRow(currentBid, newRow);
    if (new BigNumber(updatedRow.amount).eq('0')) {
      rows.splice(index, 1);
    } else {
      rows[index] = updatedRow;
    }
  }
};

export const applyBscUpdates = (orderbook: Orderbook, updates: OrderbookUpdates): void => {
  const orderbookUpdated = orderbook.updated_at || 0;
  if (updates.updated_at > orderbookUpdated) {
    for (const row of updates.data) {
      applyBscUpdate(orderbook, row);
    }
    orderbook.updated_at = updates.updated_at;
  }
};
