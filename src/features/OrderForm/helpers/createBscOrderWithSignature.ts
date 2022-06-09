/* eslint-disable */
import { LimitOrder, Signature } from '@0x/protocol-utils';
import { MetamaskSubprovider } from '@0x/subproviders';
import { BigNumber, hexUtils } from '@0x/utils';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { BscOrderWithSignature } from 'src/features/OrderForm/interfaces/bscOrderWithSignature';
import { TimeInForce } from 'src/features/OrderForm/constants/timeInForce';
import { Pair } from 'src/features/Pairs/interfaces/pair';

const getExpiry = (expiryType: number): BigNumber => {
  // unit of timestamp is second
  if (expiryType === TimeInForce.GFD) {
    return new BigNumber(Math.floor(Date.now() / 1000 + 3600 * 24));
  } else {
    // expire expire at 2100/1/1 instead of til end because expiry
    return new BigNumber(Math.floor(new Date(2100, 1, 1).getTime() / 1000));
  }
};

const buildBscOrder = (
  makerToken: string,
  takerToken: string,
  makerAmount: BigNumber,
  takerAmount: BigNumber,
  maker: string,
  expiry: BigNumber,
  tradingFeeAmount: BigNumber,
): LimitOrder => {
  return new LimitOrder({
    makerToken: makerToken,
    takerToken: takerToken,
    makerAmount: new BigNumber(makerAmount).dp(0, BigNumber.ROUND_FLOOR),
    takerAmount: new BigNumber(takerAmount).dp(0, BigNumber.ROUND_FLOOR),
    maker: maker,
    // fake
    taker: '0x0000000000000000000000000000000000000000',
    sender: `${process.env.REACT_APP_MATCHER_ADDRESS}`,
    takerTokenFeeAmount: tradingFeeAmount,
    feeRecipient: `${process.env.REACT_APP_FEE_RECEIPENT_ADDRESS}`,
    // fake
    pool: '0x0000000000000000000000000000000000000000000000000000000000000000',
    expiry: expiry,
    salt: new BigNumber(hexUtils.random()),
    chainId: Number(process.env.REACT_APP_CHAIN_ID),
    verifyingContract: `${process.env.REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS}`,
  });
};

const signOrder = async (order: LimitOrder): Promise<Signature> => {
  const provider = new MetamaskSubprovider(window.web3.currentProvider);
  return await order.getSignatureWithProviderAsync(provider, 2);
};

const round = (n: BigNumber): BigNumber => {
  return new BigNumber(n.toFixed(0, BigNumber.ROUND_FLOOR));
};

export const createBscOrderWithSignature = async (
  behaviour: Behaviour,
  selectedPair: Pair,
  amount: string | BigNumber,
  price: number | string | BigNumber,
  total: string | BigNumber,
  tradingFee: string,
  publicKey: string,
  expiryType: number,
): Promise<BscOrderWithSignature> => {
  try {
    const baseDecimal = new BigNumber(10).pow(selectedPair.base_decimal);
    const quoteDecimal = new BigNumber(10).pow(selectedPair.quote_decimal);
    const isBuyOrder = behaviour === Behaviour.BUY;
    const makerToken = isBuyOrder ? selectedPair.quote_bsc_address : selectedPair.base_bsc_address;
    const takerToken = isBuyOrder ? selectedPair.base_bsc_address : selectedPair.quote_bsc_address;
    let makerAmount;
    let takerAmount;
    const maker = publicKey;
    const expiry = getExpiry(expiryType);
    const ratio = new BigNumber(1).minus(tradingFee);
    const calculatedAmount = new BigNumber(total).gt('0') ? new BigNumber(total).div(price) : amount;
    const calculatedTotal = new BigNumber(total).gt('0') ? total : new BigNumber(amount).times(price);
    const tradingFeeAmount = round(
      new BigNumber(isBuyOrder ? calculatedTotal : calculatedAmount)
        .times(tradingFee)
        .times(isBuyOrder ? quoteDecimal : baseDecimal),
    );
    if (behaviour === Behaviour.BUY) {
      makerAmount = ratio.times(calculatedTotal).times(quoteDecimal);
      takerAmount = round(ratio.times(calculatedAmount).times(baseDecimal));
    } else {
      makerAmount = round(ratio.times(calculatedAmount).times(baseDecimal));
      takerAmount = ratio.times(calculatedTotal).times(quoteDecimal);
    }
    const bscOrder = buildBscOrder(makerToken, takerToken, makerAmount, takerAmount, maker, expiry, tradingFeeAmount);
    const signature: Signature = await signOrder(bscOrder);

    return {
      limitOrder: bscOrder,
      signature: signature,
    };
  } catch (e) {
    throw e.message || e;
  }
};
