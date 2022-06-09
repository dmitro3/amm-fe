import Web3 from 'web3';
import TrezorConnect from 'trezor-connect';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Str from '@ledgerhq/hw-app-str';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { checkWhitelistBSC } from '../service';
import {
  MISSING_EXTENSION_ERROR,
  SoftwareWalletType,
  UninstallExtensionException,
} from 'src/features/ConnectWallet/constants/uninstallExtensionException';
import { BigNumber } from '@0x/utils';
import {
  getNetwork,
  getPublicKey as getFreighterPublicKey,
  isConnected as isInstalledFreighter,
} from '@stellar/freighter-api';

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

// connect metamask
export const connectMetaMask = async (): Promise<string> => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const accounts = window.web3.eth.getAccounts();
    return accounts[0];
  } else {
    const exception: UninstallExtensionException = {
      walletType: SoftwareWalletType.METAMASK,
      message: MISSING_EXTENSION_ERROR,
    };
    throw exception;
  }
};

// connect freighter
export const connectFreighter = async (): Promise<string> => {
  if (isInstalledFreighter()) {
    return await getFreighterPublicKey();
  } else {
    const exception: UninstallExtensionException = {
      walletType: SoftwareWalletType.FREIGHTER,
      message: MISSING_EXTENSION_ERROR,
    };
    throw exception;
  }
};

// connect hardware wallet
export const connectHardwareWallet = async (hardwareWalletType: HardwareWalletType, path?: string): Promise<string> => {
  if (hardwareWalletType === HardwareWalletType.TREZOR) {
    TrezorConnect.manifest({
      // TODO: change email and url
      email: 'my_email@example.com',
      appUrl: 'http://localhost:3000',
    });
    try {
      const response = await TrezorConnect.stellarGetAddress({
        path: path || Trezor.defaultStellarPath,
      });
      if ('address' in response.payload) {
        return response.payload.address;
      }
    } catch (e) {
      return JSON.stringify(e);
    }
  } else if (hardwareWalletType === HardwareWalletType.LEDGER) {
    const transport = await TransportWebUSB.request();
    try {
      const str = new Str(transport);
      const response = await str.getPublicKey(path || Ledger.defaultStellarPath);
      return response.publicKey;
    } catch (e) {
      return JSON.stringify(e);
    }
  }
  return '';
};

// bsc method
export const checkConnectedWalletAfterReload = async (): Promise<boolean> => {
  // MetaMask connected condition
  let accounts = [];
  if (window.ethereum) {
    accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
  }
  // return accounts.length;
  return accounts.length ? await checkWhitelistBSC(accounts[0]) : false;
};

export const getCurrentChainId = (): string => {
  if (window.ethereum) {
    return window.ethereum.chainId;
  }
  return '-1';
};

export const isCorrectNetworkBsc = (currentChainId: string): boolean => {
  const chainId = process.env.REACT_APP_CHAIN_ID;
  if (!chainId) {
    throw new Error(`Invalid system config REACT_APP_CHAIN_ID ${process.env.REACT_APP_CHAIN_ID}`);
  }
  return new BigNumber(currentChainId).eq(chainId);
};

export const getCurrentStellarNetwork = async (): Promise<string> => {
  return await getNetwork();
};

export const isCorrectNetworkStellar = (currentNetwork: string): boolean => {
  const network = process.env.REACT_APP_STELLAR_NETWORK;
  if (currentNetwork !== 'PUBLIC' && currentNetwork !== 'TESTNET') {
    throw new Error("Invalid currentNetwork param, just accept 'PUBLIC' or 'TESTNET'");
  }
  if (!network) {
    throw new Error(`Invalid system config REACT_APP_STELLAR_NETWORK ${process.env.REACT_APP_STELLAR_NETWORK}`);
  }
  return network === currentNetwork;
};

// check connect to at least 1 wallet
export const isConnected = (wallet: WalletData): boolean => {
  return !!(wallet.bsc || wallet.freighter || wallet.trezor.publicKey || wallet.ledger.publicKey || wallet.privateKey);
};

export default {
  connectMetaMask,
  connectHardwareWallet,
  checkConnectedWalletAfterReload,
  isCorrectNetwork: isCorrectNetworkBsc,
  isConnected,
};
