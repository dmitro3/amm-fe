export interface UserWallet {
  id: number;
  user_id: number;
  address: string;
  coin_id: number;
  is_active: number;
  created_at: string;
  update_at: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
export interface ResData<T> {
  code: number;
  data: T;
  metadata: { [key: string]: any };
}
