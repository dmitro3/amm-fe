export enum NotificationType {
  OrderBookTradingFee = 'OrderBookTradingFee',
  PoolSwapFee = 'PoolSwapFee',
  PoolRequest = 'PoolRequest',
  Wallet = 'Wallet',
  Confidence = 'Confidence',
  Coin = 'Coin',
}

export enum PoolStatus {
  Pending = 1,
  Rejected = 2,
  Created = 3,
}

export enum PoolStatusLabel {
  Pending = 'Pending',
  Rejected = 'Rejected',
  Created = 'Created',
}

export enum PoolType {
  Fixed = 1,
  Flexible = 2,
}

export const PoolTypeCreated = {
  Fixed: false,
  Flexible: true,
};

export enum ReadStatus {
  Unread = 0,
  Read = 1,
}
