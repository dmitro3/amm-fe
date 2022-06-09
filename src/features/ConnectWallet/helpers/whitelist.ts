import { BalanceStellar } from 'src/features/ConnectWallet/interfaces/HardwareWalletData';
import { Pair } from 'src/features/Pairs/interfaces/pair';
import { DEFAULT_ADDRESS } from 'src/features/ConnectWallet/constants/hardwareWallet';
import { getStellarAssetType } from 'src/features/Orderbook/helpers/orderbookHelper';

export const isWhitelistStellar = (balances: Array<BalanceStellar>, pairs: Array<Pair>): boolean => {
  if (pairs.length) {
    for (const pair of pairs) {
      const baseCoin = {
        asset_code: pair.base_symbol,
        asset_issuer: pair.base_stellar_issuer,
        asset_type: pair.base_type,
      };
      const targetCoin = {
        asset_code: pair.quote_symbol,
        asset_issuer: pair.quote_stellar_issuer,
        asset_type: pair.quote_type,
      };
      const baseCoinInBalance = balances.find(
        (asset: BalanceStellar) =>
          asset.asset_code == baseCoin.asset_code &&
          asset.asset_issuer == baseCoin.asset_issuer &&
          asset.asset_type == getStellarAssetType(baseCoin.asset_type),
      );
      const targetCoinInBalance = balances.find(
        (asset: BalanceStellar) =>
          asset.asset_code == targetCoin.asset_code &&
          asset.asset_issuer == targetCoin.asset_issuer &&
          asset.asset_type == getStellarAssetType(targetCoin.asset_type),
      );
      if (!baseCoinInBalance || !targetCoinInBalance) {
        return false;
      }
      const whitelisted =
        baseCoinInBalance.is_authorized &&
        baseCoinInBalance.is_authorized_to_maintain_liabilities &&
        targetCoinInBalance.is_authorized &&
        targetCoinInBalance.is_authorized_to_maintain_liabilities;
      if (!whitelisted) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const isWhitelistBSC = (addresses: Array<string>): boolean => {
  return addresses.filter((address: string) => address !== DEFAULT_ADDRESS).length > 0;
};

export default { isWhitelistBSC, isWhitelistStellar };
