/* eslint-disable max-len */
import { zeroExABI } from 'src/constants/abi/zeroExABI';
import { approve } from 'src/features/OrderForm/helpers/approve/approve';
import { BscOrderWithSignature } from 'src/features/OrderForm/interfaces/bscOrderWithSignature';
import Web3 from 'web3';

export const sendBscOrderToSmartContract = async (
  bscOrderWithSignature: BscOrderWithSignature,
  publicKey: string,
): Promise<void> => {
  try {
    if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      const exchangeProxyContract = new web3.eth.Contract(
        // @ts-ignore
        zeroExABI,
        `${process.env.REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS}`,
      );

      const allAmount = bscOrderWithSignature.limitOrder.makerAmount.plus(
        bscOrderWithSignature.limitOrder.takerTokenFeeAmount,
      );

      // check approve 1 more time before sending order
      await approve(
        bscOrderWithSignature.limitOrder.makerToken,
        publicKey,
        allAmount,
        process.env.REACT_APP_EXCHANGE_PROXY_CONTRACT_ADDRESS || '',
      );

      // create order
      await exchangeProxyContract.methods
        .createLimitOrder(JSON.parse(JSON.stringify(bscOrderWithSignature.limitOrder)), bscOrderWithSignature.signature)
        .send({ from: publicKey });
    }
  } catch (e) {
    throw e.message;
  }
};
