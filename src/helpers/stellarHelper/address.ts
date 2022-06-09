import { Keypair, Server } from 'stellar-sdk';
import BigNumber from 'bignumber.js';

export const getPublicKeyFromPrivateKey = (secret: string): string => {
  try {
    const keyPair = Keypair.fromSecret(secret);
    return keyPair.publicKey();
  } catch (e) {
    return '';
  }
};

export const isStellarPublicKey = (address: string): boolean => {
  try {
    return !!Keypair.fromPublicKey(address);
  } catch (e) {
    return false;
  }
};

export const isStellarSecret = (secret: string): boolean => {
  try {
    return !!Keypair.fromSecret(secret);
  } catch (e) {
    return false;
  }
};

export const isStellarAccountActive = async (address: string): Promise<boolean> => {
  try {
    const server = new Server(`${process.env.REACT_APP_HORIZON}`);
    const account = await server.loadAccount(address);

    if (account.balances) {
      const nativeBalance = account.balances.find((item) => {
        return item.asset_type === 'native';
      });
      return new BigNumber(nativeBalance?.balance || '0').isGreaterThan(1);
    }
    return false;
  } catch (e) {
    return false;
  }
};

export default { getPublicKeyFromPrivateKey, isStellarPublicKey, isStellarSecret };
