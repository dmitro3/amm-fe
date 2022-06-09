import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TradingMethodItem } from 'src/interfaces';
import { bscIcon, StellarOrderBookDarkIcon, StellarOrderBookLightIcon } from 'src/assets/icon';
import { getCookieStorage } from 'src/helpers/storage';

const tradingMethodOptions: Array<TradingMethodItem> = [
  {
    darkIcon: StellarOrderBookDarkIcon,
    lightIcon: StellarOrderBookLightIcon,
    text: 'Order Book',
    symbol: 'OB',
    key: 1,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'Order Book',
    symbol: 'OB',
    key: 2,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'FCX Liquidity Pool',
    symbol: 'FCX LP',
    key: 4,
  },
  {
    darkIcon: bscIcon,
    lightIcon: bscIcon,
    text: 'Pancakeswap Liquidity Pool',
    symbol: 'Pancakeswap LP',
    key: 8,
  },
];

interface InitialState {
  selectedMethods: Array<TradingMethodItem>;
}

const getSelectedMethod = () => {
  const tradingMethod = getCookieStorage('trading_method');
  const cookieMethod = tradingMethod ? JSON.parse(tradingMethod) : undefined;
  const defaultStateMethod = [...tradingMethodOptions];
  if (!cookieMethod) return defaultStateMethod;
  if (cookieMethod) {
    cookieMethod.map((item: TradingMethodItem) => {
      const method = tradingMethodOptions.find((e) => e.key === item.key);
      if (method) {
        item.lightIcon = method.lightIcon;
        item.darkIcon = method.darkIcon;
      }
    });
    return cookieMethod;
  }
};

const initialState: InitialState = {
  selectedMethods: getSelectedMethod(),
};

export const tradingMethodsSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setSelectedMethods: (state, action: PayloadAction<Array<TradingMethodItem>>) => {
      state.selectedMethods = action.payload.sort((a, b) => a.key - b.key);
    },
  },
});

export const { setSelectedMethods } = tradingMethodsSlice.actions;

const { reducer: pairReducer } = tradingMethodsSlice;

export default pairReducer;
