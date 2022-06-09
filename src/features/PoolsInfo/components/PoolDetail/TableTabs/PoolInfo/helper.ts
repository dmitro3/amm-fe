import { Crp } from 'src/constants/abi/Crp';
import Web3 from 'web3';

export interface Rights {
  0: boolean;
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
  5: boolean;
  6: boolean;
  canAddRemoveTokens: boolean;
  canChangeCap: boolean;
  canChangeProtocolFee: boolean;
  canChangeSwapFee: boolean;
  canChangeWeights: boolean;
  canPauseSwapping: boolean;
  canWhitelistLPs: boolean;
}

export async function getRights(controller: string): Promise<Rights | undefined> {
  if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    const CrpInstance = new window.web3.eth.Contract(Crp, controller);
    return await CrpInstance.methods.rights().call();
  }
  return undefined;
}
