import { EORDER_TYPE } from 'src/features/MyTransactions/Constant';
import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { SORType } from 'src/features/OrderForm/constants/sorType';
import { TimeInForce } from 'src/features/OrderForm/constants/timeInForce';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { TradingMethodItem } from 'src/interfaces';

export interface OrderConfirmationData {
  selectedMethods: Array<TradingMethodItem>;
  sorType?: SORType;
  slippageTolerance?: string;

  // -- order book --
  orderType?: EORDER_TYPE;
  behaviour?: Behaviour;
  selectedPair?: Pair;
  price?: string;
  amount?: string;
  total?: string;
  duration?: TimeInForce;

  // liquidity pool
  firstAmount?: string;
  secondAmount?: string;
  pricePerUnit?: string;

  // sor
  warp?: boolean;
}
