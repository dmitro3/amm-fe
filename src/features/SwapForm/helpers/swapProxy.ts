import axios from 'axios';
import Web3 from 'web3';

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  tokenAmountIn: string;
  slippagePercentage: string;
  inputTo: boolean;
  sources: string;
}

// TODO: update this
interface SwapData {
  [key: string]: any;
}

export async function getSwapData(params: SwapParams): Promise<any> {
  const weiAmount = Web3.utils.toWei(params.tokenAmountIn, 'ether');
  const trade = params.inputTo ? { buyAmount: weiAmount } : { sellAmount: weiAmount };

  const url = `${process.env.REACT_APP_BASE_SOR}/swap/v1/quote`;
  const response = await axios.get(url, {
    params: {
      buyToken: params.tokenOut,
      sellToken: params.tokenIn,
      ...trade,
      slippagePercentage: params.slippagePercentage,
      includedSources: params.sources,
    },
  });

  return response;
}

export async function swap(swapData: SwapData, publicKey: string): Promise<any> {
  if (window.web3) {
    await window.ethereum.enable();
    window.web3 = new Web3(window.web3.currentProvider);

    const data = swapData;
    data['from'] = publicKey;
    delete data['gas'];
    await window.web3.eth.sendTransaction(data);
  }
}
