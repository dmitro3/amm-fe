export interface TradingMethodItem {
  darkIcon: string;
  lightIcon: string;
  symbol: string;
  text: string;
  key: number;
}

export const TradingFeeSetting = {
  is_active: false,
  network: '',
  order_type: '',
  old_value: '',
  new_value: '',
};

export interface TradingFeeSetting {
  is_active: boolean;
  network: string;
  order_type: string;
  old_value: string;
  new_value: string;
}
