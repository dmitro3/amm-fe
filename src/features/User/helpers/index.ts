export const renderAddressWallet = (address: string): string =>
  address ? address.slice(0, 5) + '...' + address.slice(-3) : '';
