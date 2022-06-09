export enum NotificationVariant {
  Success = 'success',
  Error = 'error',
}
export interface Notification {
  type: NotificationVariant;
  content: string;
}
