export const formatPoolId = (poolId: string): string => {
  return poolId.toString().substr(0, 6) + '...' + poolId.toString().substr(-4);
};
