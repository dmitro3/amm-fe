import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { getPublicKeyFromPrivateKey } from 'src/helpers/stellarHelper/address';

export const getBscAddress = (wallet: WalletData): string => {
  return wallet.bsc || '';
};

export const getStellarAddress = (wallet: WalletData): string => {
  return (
    wallet.freighter ||
    wallet.trezor.publicKey ||
    wallet.ledger.publicKey ||
    getPublicKeyFromPrivateKey(wallet.privateKey) ||
    ''
  );
};
