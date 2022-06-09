export enum StellarOperationErrorCode {
  OP_CROSS_SELF = 'op_cross_self',
  OP_UNDERFUNDED = 'op_underfunded',
}

export enum StellarTransactionErrorCode {
  TX_BAD_AUTH = 'tx_bad_auth',
  TX_TOO_LATE = 'tx_too_late',
}

export enum BSCError {
  WRONG_NETWORK = 'wrong network',
}

export enum MetaMaskErrorMessage {
  DENIED_TRANSACTION_SIGNATURE = 'MetaMask Tx Signature: User denied transaction signature.',
  DENIED_MESSAGE_SIGNATURE = 'MetaMask Message Signature: User denied message signature.',
}

export enum FreighterErrorMessage {
  USER_DECLINED_ACCESS = 'User declined access',
}
