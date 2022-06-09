export const TIMEOUT = 120000;
export { default as routeConstants } from './routeConstants';
export * from './user-role';
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
