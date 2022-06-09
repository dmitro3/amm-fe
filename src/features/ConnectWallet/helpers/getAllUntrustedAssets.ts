import { getAllAssetsFromCoins } from 'src/helpers/getAllAssetsFromCoins';
import { getAllBalanceInStellar } from 'src/helpers/getBalance';
import { Asset } from 'stellar-sdk';

export const getAllUntrustedAssets = async (publicKey: string, allCoins: any[]): Promise<Array<Asset>> => {
  const allUntrustedAssets: Array<Asset> = [];
  if (!!publicKey) {
    const assets = getAllAssetsFromCoins(allCoins);
    const balances = await getAllBalanceInStellar(publicKey);
    for (const asset of assets) {
      const data = balances.find((b: any) => {
        return (
          b.limit === '922337203685.4775807' &&
          b.asset_type === asset.getAssetType() &&
          b.asset_code === asset.code &&
          b.asset_issuer === asset.issuer
        );
      });
      if (!data) {
        allUntrustedAssets.push(asset);
      }
    }
  }
  return allUntrustedAssets;
};
