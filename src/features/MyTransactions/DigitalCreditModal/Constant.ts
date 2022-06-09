export interface ICoin {
  id: number;
  name: string;
  symbol: string;
  stellar_issuer: string;
  evrynet_address: string;
  decimal: number;
  type: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}
