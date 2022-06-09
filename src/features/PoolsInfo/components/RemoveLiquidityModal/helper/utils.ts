import BigNumber from 'bignumber.js';
import request, { gql } from 'graphql-request';
import { Crp } from 'src/constants/abi/Crp';
import Web3 from 'web3';

const BONE = new BigNumber(10).pow(18);
const BPOW_PRECISION = BONE.idiv(new BigNumber(10).pow(10));
const EXIT_FEE = new BigNumber(0);

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

export function calcSingleOutGivenPoolIn(
  tokenBalanceOut: BigNumber,
  tokenWeightOut: BigNumber,
  poolSupply: BigNumber,
  totalWeight: BigNumber,
  poolAmountIn: BigNumber,
  swapFee: BigNumber,
): BigNumber {
  const normalizedWeight = bdiv(tokenWeightOut, totalWeight);
  const poolAmountInAfterExitFee = bmul(poolAmountIn, BONE.minus(EXIT_FEE));
  const newPoolSupply = poolSupply.minus(poolAmountInAfterExitFee);
  const poolRatio = bdiv(newPoolSupply, poolSupply);

  const tokenOutRatio = bpow(poolRatio, bdiv(BONE, normalizedWeight));
  const newTokenBalanceOut = bmul(tokenOutRatio, tokenBalanceOut);

  const tokenAmountOutBeforeSwapFee = tokenBalanceOut.minus(newTokenBalanceOut);

  const zaz = bmul(BONE.minus(normalizedWeight), swapFee);
  const tokenAmountOut = bmul(tokenAmountOutBeforeSwapFee, BONE.minus(zaz));
  return tokenAmountOut;
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

export async function getCrpController(poolAddress: string, callData: string): Promise<string> {
  const url = `${process.env.REACT_APP_SUBGRAPH}`;
  const query = gql`
        query getPool {
            pools (where: {
            id: "${poolAddress}", 
            }) {
            crpController
            controller
            }
        }`;
  const result = await request(url, query);
  if (callData === 'crpController') return result.pools[0].crpController;
  else if (callData === 'controller') return result.pools[0].controller;
  else return '';
}

export async function getTotalShares(controller: string): Promise<string> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    const totalShare = await CrpInstance.methods.totalSupply().call();
    return normalizeBalance(new BigNumber(totalShare), 18).toString();
  }
  return '';
}
