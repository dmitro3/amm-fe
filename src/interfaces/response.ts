export interface IResponseService<T> {
  code: number;
  data: T;
  metadata: {
    [key: string]: any;
  };
}
