import { Orderbook } from 'src/features/Orderbook/interfaces/orderbook';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { Source } from 'src/features/SOR/constances/source';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';

export interface SORData {
  isLoadingSORData: boolean;
  averagePrice: string;
  price: string;
  stellarOB: {
    source: Source;
    amount: string;
    proportion: string;
  };
  bscOB: {
    source: Source;
    amount: string;
    proportion: string;
  };
  bscLP: {
    source: Source;
    amount: string;
    proportion: string;
  };
  pancakeswapLP: {
    source: Source;
    amount: string;
    proportion: string;
  };
}

export interface QueryParam {
  buyToken: string;
  sellToken: string;
  amount: string;
  behaviour: Behaviour;
  xlmFeeRate: string;
  fcxFeeRate: string;
  xlmSellTokenBalance?: string;
  bscSellTokenBalance?: string;
  includedSources: Array<Source>;
  slippagePercentage?: string;
  sorType?: SORType;
  amountPrecision: number;
  pricePrecision: number;
  decimal: number;
  behaviourWithPair?: Behaviour;
  buyAmount?: string;
  sellAmount?: string;
}

export interface NetworkData {
  name: string;
  orderbook: Orderbook;
  balance: string;
}

export interface SORSource {
  name: string;
  proportion: string;
}

export interface SOROrder {
  makerAmount: string;
  takerAmount: string;
  source: Source;
}

export interface SORResponse {
  orders: SOROrder[];
  sources: SORSource[];
}
