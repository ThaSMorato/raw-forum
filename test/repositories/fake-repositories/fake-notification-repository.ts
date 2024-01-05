import { vi } from 'vitest'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'

const create = vi.fn()
const findById = vi.fn()
const save = vi.fn()

export const functions = {
  create,
  findById,
  save,
}

export const fakeNotificationsRepository: NotificationsRepository = functions
