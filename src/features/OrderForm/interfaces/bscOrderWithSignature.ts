import { LimitOrder, Signature } from '@0x/protocol-utils';

export interface BscOrderWithSignature {
  limitOrder: LimitOrder;
  signature: Signature;
}
