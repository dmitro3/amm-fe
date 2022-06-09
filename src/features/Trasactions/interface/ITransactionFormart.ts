export interface ITransactionFormart {
  id: string;
  name: string;
  price: string;
  tokenAmountIn: string;
  tokenAmountOut: string;
  poolAddress: string;
  time: string;
}
export interface ITransaction {
  id: string;
  tokenInSym: string;
  tokenOutSym: string;
  tokenAmountIn: string;
  tokenAmountOut: string;
  poolAddress: { id: string };
  timestamp: number;
}
