import { Notification } from '../../enterprise/entities/notification'

export interface NotificationsRepository {
  create(notification: Notification): Promise<void>
  findById(notificationId: string): Promise<Notification | null>
  save(notification: Notification): Promise<void>
}
