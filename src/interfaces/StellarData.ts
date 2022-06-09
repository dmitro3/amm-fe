export interface StellarData {
  price: string;
  amount: string;
  price_r: { n: number; d: number };
}

export interface OrderbookData {
  type: string;
  textColor: string;
  color: string;
  data: { price: string; amount: string; total: string }[];
}

export interface params {
  selling_asset_code: string;
  selling_asset_issuer: string;
  selling_asset_type: string;
  buying_asset_type: string;
  buying_asset_code: string;
  buying_asset_issuer: string;
  limit: number;
}

export interface IStellarData {
  bids: StellarData[];
  asks: StellarData[];
  base: AssetData;
  counter: AssetData;
}

export interface AssetData {
  asset_code: string;
  asset_issuer: string;
  asset_type: string;
}
