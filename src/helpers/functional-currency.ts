import { FunctionCurrency } from 'src/interfaces/user';
import { RootState } from 'src/store/store';

export const currencySelector = (state: RootState): FunctionCurrency => {
  const functionalCurrencies = state.functionalCurrency.functionalCurrencies;
  const selectedFunctionalCurrencyId = state.auth.currentUser.selectedFunctionalCurrencyId;
  return (
    functionalCurrencies?.data?.find((currency) => currency.id === selectedFunctionalCurrencyId) || {
      id: 0,
      symbol: '$',
      number_basic: 0,
      iso_code: 'USD',
      fractional_unit: '',
      digital_credits: 'vUSD',
      currency: 'USD',
    }
  );
};
