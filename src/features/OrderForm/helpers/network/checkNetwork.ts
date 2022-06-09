import { tradingMethodOptions } from 'src/components/Navigation/contants';
import { TradingMethod } from 'src/constants/dashboard';
import { WalletData } from 'src/features/ConnectWallet/interfaces/WalletData';
import { TradingNetwork } from 'src/features/OrderForm/constants/tradingNetwork';
import { CheckNetworkData } from 'src/features/OrderForm/interfaces/checkNetworkData';
import { TradingMethodItem } from 'src/interfaces';

const totalTradingMethods = tradingMethodOptions.length;

export const isSingleStellarOB = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 1) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.StellarOrderbook;
    });
    return filteredData.length === 1;
  }
  return false;
};

export const isSingleBscOB = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 1) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.BSCOrderbook;
    });
    return filteredData.length === 1;
  }
  return false;
};

export const isCombineOB = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 2) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.StellarOrderbook || item.key === TradingMethod.BSCOrderbook;
    });
    return filteredData.length === 2;
  }
  return false;
};

export const isSingleBscLP = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 1) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.BSCPool;
    });
    return filteredData.length === 1;
  }
  return false;
};

export const isSinglePancakeswapLP = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 1) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.PancakeswapPool;
    });
    return filteredData.length === 1;
  }
  return false;
};

export const isBscOBLP = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 2) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.BSCOrderbook || item.key === TradingMethod.BSCPool;
    });
    return filteredData.length === 2;
  }
  return false;
};

export const isStellarOBFcxLP = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 2) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.StellarOrderbook || item.key === TradingMethod.BSCPool;
    });
    return filteredData.length === 2;
  }
  return false;
};

export const isStellarOBPancakeswapLP = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length === 2) {
    const filteredData = selectedMethods.filter((item) => {
      return item.key === TradingMethod.StellarOrderbook || item.key === TradingMethod.PancakeswapPool;
    });
    return filteredData.length === 2;
  }
  return false;
};

export const isContainBsc = (selectedMethods: TradingMethodItem[]): boolean => {
  return !!selectedMethods.find(
    (i: TradingMethodItem) =>
      i.key === TradingMethod.BSCPool ||
      i.key === TradingMethod.BSCOrderbook ||
      i.key === TradingMethod.PancakeswapPool,
  );
};

export const isAllMethods = (selectedMethods: TradingMethodItem[]): boolean => {
  return selectedMethods.length === totalTradingMethods;
};

export const isSOR = (selectedMethods: TradingMethodItem[]): boolean => {
  return selectedMethods.length > 1;
};

export const isSORCombined2Network = (selectedMethods: TradingMethodItem[]): boolean => {
  if (selectedMethods.length < 2) {
    return false;
  }

  const filterStellarData = selectedMethods.filter((item) => {
    return item.key === TradingMethod.StellarOrderbook;
  });
  const filterBscData = selectedMethods.filter((item) => {
    return (
      item.key === TradingMethod.BSCPool || item.key === TradingMethod.BSCOrderbook || TradingMethod.PancakeswapPool
    );
  });

  return filterStellarData.length >= 1 && filterBscData.length >= 1;
};

export const isContainStellarOB = (selectedMethods: TradingMethodItem[]): boolean => {
  const filterLBData = selectedMethods.filter((item) => {
    return item.key === TradingMethod.StellarOrderbook;
  });

  return filterLBData.length === 1;
};

export const isContainBscOB = (selectedMethods: TradingMethodItem[]): boolean => {
  const filterLBData = selectedMethods.filter((item) => {
    return item.key === TradingMethod.BSCOrderbook;
  });

  return filterLBData.length === 1;
};

export const isContainBscLB = (selectedMethods: TradingMethodItem[]): boolean => {
  const filterLBData = selectedMethods.filter((item) => {
    return item.key === TradingMethod.BSCPool;
  });

  return filterLBData.length === 1;
};

export const isContainPancakeswapLB = (selectedMethods: TradingMethodItem[]): boolean => {
  const filterLBData = selectedMethods.filter((item) => {
    return item.key === TradingMethod.PancakeswapPool;
  });

  return filterLBData.length === 1;
};

// export const getTradingMethod = (selectedMethods: TradingMethodItem[]): TradingMethod => {
//   if (isSingleStellarOB(selectedMethods)) {
//     return TradingMethod.StellarOrderbook;
//   } else if (isSingleBscOB(selectedMethods)) {
//     return TradingMethod.BSCOrderbook;
//   } else if (isCombineOB(selectedMethods)) {
//     return TradingMethod.CombinedOrderbook;
//   } else if (isSingleBscLP(selectedMethods)) {
//     return TradingMethod.BSCPool;
//   } else {
//     return TradingMethod.All;
//   }
// };

export const checkNetwork = (wallet: WalletData, selectedMethods: TradingMethodItem[]): CheckNetworkData => {
  if (isSingleStellarOB(selectedMethods)) {
    const isOnTheSameNetwork = !!(
      wallet.freighter ||
      wallet.trezor.publicKey ||
      wallet.ledger.publicKey ||
      wallet.privateKey
    );
    return {
      isOnTheSameNetwork,
      message: !isOnTheSameNetwork
        ? `You are trading on ${TradingNetwork.STELLAR}
          . Please connect to a wallet that support ${TradingNetwork.STELLAR}`
        : '',
    };
  } else if (isSingleBscOB(selectedMethods) || isSingleBscLP(selectedMethods)) {
    const isOnTheSameNetwork = !!wallet.bsc;
    return {
      isOnTheSameNetwork,
      message: !isOnTheSameNetwork
        ? `You are trading on ${TradingNetwork.BSC}. Please connect to a wallet that support ${TradingNetwork.BSC}`
        : '',
    };
  } else if (isCombineOB(selectedMethods) || isAllMethods(selectedMethods) || isStellarOBFcxLP(selectedMethods)) {
    const isOnStellar = !!(wallet.freighter || wallet.trezor.publicKey || wallet.ledger.publicKey || wallet.privateKey);
    const isOnBsc = !!wallet.bsc;

    const isOnTheSameNetwork = isOnStellar && isOnBsc;

    if (!isOnStellar) {
      return {
        isOnTheSameNetwork,
        message: !isOnTheSameNetwork
          ? `Wallets on both networks are required for cross-network trading
            . Please connect to wallet that support ${TradingNetwork.STELLAR}`
          : '',
      };
    } else if (!isOnBsc) {
      return {
        isOnTheSameNetwork,
        message: !isOnTheSameNetwork
          ? `Wallets on both networks are required for cross-network trading
            . Please connect to wallet that support ${TradingNetwork.BSC}`
          : '',
      };
    } else {
      return {
        isOnTheSameNetwork,
        message: '',
      };
    }
  } else if (isBscOBLP(selectedMethods)) {
    return {
      isOnTheSameNetwork: true,
      message: '',
    };
  } else {
    // TODO: check others case
    return {
      isOnTheSameNetwork: false,
      message: '',
    };
  }
};

export const isConnectedWalletWithSuitableNetwork = (
  wallet: WalletData,
  selectedMethods: TradingMethodItem[],
): {
  isConnected: boolean;
  buttonContent: string;
} => {
  if (isSingleStellarOB(selectedMethods)) {
    return {
      isConnected: !!(wallet.freighter || wallet.trezor.publicKey || wallet.ledger.publicKey || wallet.privateKey),
      buttonContent: 'Connect Stellar wallet',
    };
  } else if (isContainBsc(selectedMethods) && !isContainStellarOB(selectedMethods)) {
    return {
      isConnected: !!wallet.bsc,
      buttonContent: 'Connect BSC wallet',
    };
  } else if (isContainBsc(selectedMethods) && isContainStellarOB(selectedMethods)) {
    const isOnStellar = !!(wallet.freighter || wallet.trezor.publicKey || wallet.ledger.publicKey || wallet.privateKey);
    const isOnBsc = !!wallet.bsc;
    let content = 'Connect wallet';
    if (isOnBsc && !isOnStellar) {
      content = 'Connect Stellar wallet';
    } else if (isOnStellar && !isOnBsc) {
      content = 'Connect BSC wallet';
    }

    return {
      isConnected: isOnStellar && isOnBsc,
      buttonContent: content,
    };
  } else {
    // TODO: check others case
    return {
      isConnected: false,
      buttonContent: 'Connect wallet',
    };
  }
};
