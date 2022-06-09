export enum Message {
  WARP_FAILED = 'Warp transaction failed',
  ORDER_REJECTED = 'Order rejected',
  NOT_ENOUGH_BALANCE = 'Not enough balance to execute order',
  CANNOT_MATCH_PREVIOUS_ORDER = 'Sorry, you can not place an order that matches your previous order',
  WARP_TRANSACTION_REJECTED = 'Warp transaction rejected',
  TIME_LIMITED_EXCEEDED = 'Order failed because time limit exceeded',
}
