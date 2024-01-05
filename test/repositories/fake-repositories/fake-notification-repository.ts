import { vi } from 'vitest'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'

const create = vi.fn()

export const functions = {
  create,
}

export const fakeNotificationsRepository: NotificationsRepository = functions
