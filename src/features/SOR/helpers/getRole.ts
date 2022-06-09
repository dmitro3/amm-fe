import { whitelistABI } from 'src/constants/abi/whitelistABI';
import { DEFAULT_ADDRESS } from 'src/features/ConnectWallet/constants/hardwareWallet';
import { Role } from 'src/features/SOR/constances/role';
import Web3 from 'web3';

export const getRole = async (address: string): Promise<Role | undefined> => {
  try {
    if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      const whitelistContract = new web3.eth.Contract(
        // @ts-ignore
        whitelistABI,
        process.env.REACT_APP_WHITELIST_CONTRACT_ADDRESS || '',
      );

      const roles = await whitelistContract.methods.getRoles(address).call();

      if (roles[0] !== DEFAULT_ADDRESS) {
        return Role.ADMIN;
      } else if (roles[1] !== DEFAULT_ADDRESS) {
        return Role.RESTRICTED;
      } else if (roles[2] !== DEFAULT_ADDRESS) {
        return Role.UNRESTRICTED;
      } else {
        return undefined;
      }
    }
  } catch (e) {
    return undefined;
  }
};
