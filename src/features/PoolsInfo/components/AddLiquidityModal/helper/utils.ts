import Web3 from 'web3';
import { Crp } from 'src/constants/abi/Crp';
import BigNumber from 'bignumber.js';
import { BPool } from 'src/constants/abi/BPool';

const BONE = new BigNumber(10).pow(18);
const BPOW_PRECISION = BONE.idiv(new BigNumber(10).pow(10));

function btoi(a: BigNumber): BigNumber {
  return a.idiv(BONE);
}

function bfloor(a: BigNumber): BigNumber {
  return btoi(a).times(BONE);
}

function bsubSign(a: BigNumber, b: BigNumber): { res: BigNumber; bool: boolean } {
  if (a.gte(b)) {
    const res = a.minus(b);
    const bool = false;
    return { res, bool };
  } else {
    const res = b.minus(a);
    const bool = true;
    return { res, bool };
  }
}

export function bmul(a: BigNumber, b: BigNumber): BigNumber {
  const c0 = a.times(b);
  const c1 = c0.plus(BONE.div(new BigNumber(2)));
  const c2 = c1.idiv(BONE);
  return c2;
}

export function bdiv(a: BigNumber, b: BigNumber): BigNumber {
  const c0 = a.times(BONE);
  const c1 = c0.plus(b.div(new BigNumber(2)));
  const c2 = c1.idiv(b);
  return c2;
}

function bpowi(a: BigNumber, n: BigNumber): BigNumber {
  let z = !n.modulo(new BigNumber(2)).eq(new BigNumber(0)) ? a : BONE;

  for (n = n.idiv(new BigNumber(2)); !n.eq(new BigNumber(0)); n = n.idiv(new BigNumber(2))) {
    a = bmul(a, a);
    if (!n.modulo(new BigNumber(2)).eq(new BigNumber(0))) {
      z = bmul(z, a);
    }
  }
  return z;
}

function bpowApprox(base: BigNumber, exp: BigNumber, precision: BigNumber): BigNumber {
  const a = exp;
  const { res: x, bool: xneg } = bsubSign(base, BONE);
  let term = BONE;
  let sum = term;
  let negative = false;
  const LOOP_LIMIT = 1000;

  let idx = 0;
  for (let i = 1; term.gte(precision); i++) {
    idx += 1;
    // Some values cause it to lock up the browser
    // Test case: Remove Liquidity, single asset, poolAmountIn >> max
    // Should be halted before calling this, but...
    // Retain this halt after a max iteration limit as a backstop/failsafe
    if (LOOP_LIMIT == idx) {
      break;
    }

    const bigK = new BigNumber(i).times(BONE);
    const { res: c, bool: cneg } = bsubSign(a, bigK.minus(BONE));
    term = bmul(term, bmul(c, x));
    term = bdiv(term, bigK);
    if (term.eq(new BigNumber(0))) break;

    if (xneg) negative = !negative;
    if (cneg) negative = !negative;
    if (negative) {
      sum = sum.minus(term);
    } else {
      sum = sum.plus(term);
    }
  }

  return sum;
}

function bpow(base: BigNumber, exp: BigNumber): BigNumber {
  const whole = bfloor(exp);
  const remain = exp.minus(whole);
  const wholePow = bpowi(base, btoi(whole));
  if (remain.eq(new BigNumber(0))) {
    return wholePow;
  }

  const partialResult = bpowApprox(base, remain, BPOW_PRECISION);
  return bmul(wholePow, partialResult);
}

export function calcPoolTokensByRatio(ratio: BigNumber, totalShares: string): string {
  if (ratio.isNaN()) {
    return '0';
  }
  // @TODO - fix calcs so no buffer is needed
  const buffer = new BigNumber(100);
  return ratio.times(Web3.utils.toWei(totalShares)).integerValue(BigNumber.ROUND_DOWN).minus(buffer).toString();
}

export function calcPoolOutGivenSingleIn(
  tokenBalanceIn: BigNumber,
  tokenWeightIn: BigNumber,
  poolSupply: BigNumber,
  totalWeight: BigNumber,
  tokenAmountIn: BigNumber,
  swapFee: BigNumber,
): string {
  const normalizedWeight = bdiv(tokenWeightIn, totalWeight);
  const zaz = bmul(BONE.minus(normalizedWeight), swapFee);
  const tokenAmountInAfterFee = bmul(tokenAmountIn, BONE.minus(zaz));

  const newTokenBalanceIn = tokenBalanceIn.plus(tokenAmountInAfterFee);
  const tokenInRatio = bdiv(newTokenBalanceIn, tokenBalanceIn);

  const poolRatio = bpow(tokenInRatio, normalizedWeight);
  const newPoolSupply = bmul(poolRatio, poolSupply);
  const poolAmountOut = newPoolSupply.minus(poolSupply);
  return poolAmountOut.toString();
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function denormalizeBalance(amount: BigNumber, tokenDecimals: number): BigNumber {
  return scale(amount, tokenDecimals);
}

export function normalizeBalance(amount: BigNumber, tokenDecimals: number): BigNumber {
  return scale(new BigNumber(amount), -tokenDecimals);
}

export enum ValidationError {
  NONE,
  EMPTY,
  NOT_A_NUMBER,
  NOT_POSITIVE,
}
export function validateNumberInput(input: string): ValidationError {
  if (!input) {
    return ValidationError.EMPTY;
  }
  const number = parseFloat(input);
  if (!number) {
    return ValidationError.NOT_A_NUMBER;
  }
  if (number <= 0) {
    return ValidationError.NOT_POSITIVE;
  }
  return ValidationError.NONE;
}

export async function getPoolTokens(poolAddress: string): Promise<string[]> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const bPool = new window.web3.eth.Contract(BPool, poolAddress);
    const tokens = await bPool.methods.getCurrentTokens().call();
    return tokens;
  }
  return [];
}

export async function getPoolCap(controller: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    const cap = await CrpInstance.methods.bspCap().call();
    return cap;
  }
  return '';
}

export async function canProvideLiquidity(publicKey: string, controller: string): Promise<boolean> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.canProvideLiquidity(publicKey).call();
  }
  return false;
}
