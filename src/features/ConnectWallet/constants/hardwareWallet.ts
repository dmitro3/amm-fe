import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';

export interface HardwareWallet {
  name: string;
  type: HardwareWalletType;
  defaultStellarPath: string;
}

export const Trezor: HardwareWallet = {
  name: 'Trezor',
  type: HardwareWalletType.TREZOR,
  defaultStellarPath: "m/44'/148'/0'",
};

export const Ledger: HardwareWallet = {
  name: 'Ledger',
  type: HardwareWalletType.LEDGER,
  defaultStellarPath: "44'/148'/0'",
};

export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
