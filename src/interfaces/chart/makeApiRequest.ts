export interface MakeApiRequest {
  interval: number;
  startTime: number;
  endTime: number;
  pairId?: number;
  network?: Array<number>;
}
