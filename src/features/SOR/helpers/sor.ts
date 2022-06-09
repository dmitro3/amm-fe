import BigNumber from 'bignumber.js';
import { OrderbookRow } from 'src/features/Orderbook/interfaces/orderbook';
import { NetworkData } from 'src/features/SOR/interfaces';
import { OrderSide } from 'src/features/User/Account/misc';

export const STELLAR_EPSILON = '0.000005';
export function isEqual(n1: string | BigNumber, n2: string | BigNumber, epsilon = STELLAR_EPSILON): boolean {
  return new BigNumber(n1).minus(n2).abs().lt(epsilon);
}

export interface SORResult {
  price: string;
  sources: { name: string; proportion: string }[];
  orders: { source: string; makerAmount?: string; takerAmount?: string }[];
}

/*
 * find indexes of orderbooks which have best price
 */
function getNextNetworks(
  orderbooks: OrderbookRow[][],
  currentPositions: number[],
  balances: string[],
  price: string,
  orderSide: OrderSide,
): number[] {
  const networkCount = orderbooks.length;
  let nextNetworks: number[] = [];
  for (let i = 0; i < networkCount; i++) {
    const currentPosition = currentPositions[i];
    const orderbook = orderbooks[i];
    if (currentPosition >= orderbook.length) {
      // no more row to check
      continue;
    }
    if (isEqual(balances[i], '0')) {
      // don't have enough balance
      continue;
    }
    const currentPrice = new BigNumber(orderbook[currentPosition].price);

    if (nextNetworks.length === 0) {
      const comparedResult = currentPrice.comparedTo(price);
      if (
        (comparedResult <= 0 && orderSide === OrderSide.Buy) ||
        (comparedResult >= 0 && orderSide === OrderSide.Sell)
      ) {
        // this is the first network, so is has best price now
        nextNetworks.push(i);
      }
      continue;
    }

    const lastBestNetwork = nextNetworks[nextNetworks.length - 1];
    const lastBestPrice = orderbooks[lastBestNetwork][currentPositions[lastBestNetwork]].price;
    const comparedResult = currentPrice.comparedTo(lastBestPrice);
    if (comparedResult === 0) {
      // this orderbook has same price with other orderbooks
      nextNetworks.push(i);
    } else if (
      (comparedResult < 0 && orderSide === OrderSide.Buy) ||
      (comparedResult > 0 && orderSide === OrderSide.Sell)
    ) {
      // this orderbook has better price, so we remove all other orderbook from result
      nextNetworks = [i];
    }
  }
  return nextNetworks;
}

function floor(amount: string, precision: string): string {
  const digits = -Math.log10(Number(precision));
  return new BigNumber(amount).toFixed(digits, BigNumber.ROUND_FLOOR);
}

function getSortedIndexes(numbers: string[]): number[] {
  const indexes: number[] = [];
  for (let i = 0; i < numbers.length; i++) {
    indexes.push(i);
  }

  indexes.sort((a, b) => new BigNumber(numbers[a]).comparedTo(numbers[b]));

  return indexes;
}

function getMatchableAmount(side: OrderSide, price: string, balance: string, amountPrecision: string): string {
  if (side === OrderSide.Buy) {
    return floor(new BigNumber(balance).div(price).toString(), amountPrecision);
  } else {
    return floor(balance, amountPrecision);
  }
}

function fillRemainingAmount(
  totalAmount: string,
  amounts: string[],
  availableBalances: string[],
  side: OrderSide,
  price: string,
  amountPrecision: string,
): void {
  const networkCount = amounts.length;
  const filledAmount = amounts.reduce((totalAmount, amount) => totalAmount.plus(amount), new BigNumber(0)).toString();
  let remainingAmount = new BigNumber(totalAmount).minus(filledAmount);

  const sortedIndexes = getSortedIndexes(availableBalances);
  for (let i = 0; i < networkCount; i++) {
    const network = sortedIndexes[i];
    const remainingAmountEachNetwork = floor(remainingAmount.div(networkCount - i).toString(), amountPrecision);
    const matchableAmount = getMatchableAmount(side, price, availableBalances[network], amountPrecision);
    const matchingAmount = BigNumber.min(remainingAmountEachNetwork, matchableAmount);
    amounts[network] = new BigNumber(amounts[network]).plus(matchingAmount).toString();
    remainingAmount = remainingAmount.minus(matchingAmount);
    availableBalances[network] = new BigNumber(availableBalances[network])
      .minus(new BigNumber(matchingAmount).times(price))
      .toString();
  }
}

function getSORByAmount(
  orderbooks: OrderbookRow[][],
  balances: string[],
  side: OrderSide,
  price: string,
  amount: string,
  amountPrecision: string,
): string[] {
  const networkCount = orderbooks.length;
  const availableBalances = [...balances];
  const currentPositions = new Array(networkCount).fill(0);
  const amounts = new Array(networkCount).fill('0');
  let totalAmount = new BigNumber('0');
  while (totalAmount.lt(amount)) {
    const networkIndexes = getNextNetworks(orderbooks, currentPositions, availableBalances, price, side);
    if (networkIndexes.length === 0) {
      // no more available orderbook
      fillRemainingAmount(amount, amounts, availableBalances, side, price, amountPrecision);
      break;
    }
    for (const network of networkIndexes) {
      const index = currentPositions[network];
      const currentPrice = orderbooks[network][index].price;
      const availableAmount = orderbooks[network][index].amount;
      const neededAmount = new BigNumber(amount).minus(totalAmount).toString();
      const matchableAmount = getMatchableAmount(side, currentPrice, availableBalances[network], amountPrecision);
      const matchingAmount = BigNumber.min(availableAmount, neededAmount, matchableAmount);
      if (new BigNumber(matchingAmount).gt(0)) {
        amounts[network] = new BigNumber(amounts[network]).plus(matchingAmount).toString();
        totalAmount = totalAmount.plus(matchingAmount);
        currentPositions[network] = currentPositions[network] + 1;
        if (side === OrderSide.Buy) {
          availableBalances[network] = new BigNumber(availableBalances[network])
            .minus(new BigNumber(matchingAmount).times(currentPrice))
            .toString();
        } else {
          availableBalances[network] = new BigNumber(availableBalances[network]).minus(matchingAmount).toString();
        }
      }
    }
  }
  return amounts;
}

export function calculateNetworkAmounts(
  data: NetworkData[],
  side: OrderSide,
  price: string,
  amount: string,
  amountPrecision: string,
): string[] {
  const orderbooks = data.map((networkData) => {
    const orderbook = networkData.orderbook;
    if (side === OrderSide.Buy) {
      return orderbook.asks;
    } else {
      return orderbook.bids;
    }
  });
  const balances = data.map((networkData) => networkData.balance);

  return getSORByAmount(orderbooks, balances, side, price, amount, amountPrecision);
}

export function getSOR(
  data: NetworkData[],
  side: OrderSide,
  price: string,
  amount: string,
  amountPrecision: string,
): SORResult {
  const networkCount = data.length;
  const amounts = calculateNetworkAmounts(data, side, price, amount, amountPrecision);

  const totalAmount = amounts.reduce((totalAmount, amount) => totalAmount.plus(amount), new BigNumber(0)).toString();
  if (new BigNumber(totalAmount).isZero()) throw new Error('SOR error: cannot find any order to match');
  const sources = [];
  const orders = [];
  for (let i = 0; i < networkCount; i++) {
    sources.push({
      name: data[i].name,
      proportion: new BigNumber(amounts[i]).div(totalAmount).toString(),
    });
    if (side === OrderSide.Sell) {
      orders.push({
        source: data[i].name,
        makerAmount: amounts[i],
      });
    } else if (side === OrderSide.Buy) {
      orders.push({
        source: data[i].name,
        takerAmount: amounts[i],
      });
    }
  }

  return { price, sources, orders };
}
