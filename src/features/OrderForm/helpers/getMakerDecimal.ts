import { Behaviour } from 'src/features/OrderForm/constants/behaviour';
import { DEFAULT_BSC_DECIMAL } from 'src/features/OrderForm/constants/order';
import { Pair } from 'src/features/Pairs/interfaces/pair';

export const getMakerDecimal = (selectedPair: Pair, behaviour: Behaviour, option: string): number => {
  if (option === 'Amount') {
    return option === 'Amount' ? selectedPair.quote_decimal : selectedPair.base_decimal;
  } else if (behaviour === Behaviour.SELL) {
    return option === 'Amount' ? selectedPair.base_decimal : selectedPair.quote_decimal;
  }

  return DEFAULT_BSC_DECIMAL;
};
