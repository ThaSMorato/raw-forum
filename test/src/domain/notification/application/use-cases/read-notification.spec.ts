import { makeNotification } from '$/factories/make-notification'
import {
  fakeNotificationsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-notification-repository'
import { InMemoryNotificationsRepository } from '$/repositories/in-memory/in-memory-notifications-repository'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification'
import { Notification } from '@/domain/notification/enterprise/entities/notification'

let sut: ReadNotificationUseCase
let inMemoryRepository: InMemoryNotificationsRepository

let newNotification: Notification

describe('Send Notification Use Case', () => {
  beforeEach(() => {
    newNotification = makeNotification()
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new ReadNotificationUseCase(fakeNotificationsRepository)
    })
    it('should be able to read a notification', async () => {
      functions.findById.mockResolvedValue(newNotification)
      const spyRead = vi.spyOn(newNotification, 'read')

      const response = await sut.execute({
        recipientId: String(newNotification.recipientId),
        notificationId: String(newNotification.id),
      })

      expect(response.isRight()).toBeTruthy()
      expect(spyRead).toBeCalled()
      expect(fakeNotificationsRepository.save).toBeCalled()
    })
    it('should not be able to read an invalid notification', async () => {
      functions.findById.mockResolvedValue(null)
      const spyRead = vi.spyOn(newNotification, 'read')

      const response = await sut.execute({
        recipientId: String(newNotification.recipientId),
        notificationId: `not_${newNotification.id}`,
      })

      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(spyRead).not.toBeCalled()
      expect(fakeNotificationsRepository.save).not.toBeCalled()
    })
    it('should not be able to read a notification from other user', async () => {
      functions.findById.mockResolvedValue(newNotification)
      const spyRead = vi.spyOn(newNotification, 'read')

      const response = await sut.execute({
        recipientId: `not_${String(newNotification.recipientId)}`,
        notificationId: String(newNotification.id),
      })

      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(spyRead).not.toBeCalled()
      expect(fakeNotificationsRepository.save).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryNotificationsRepository()
      sut = new ReadNotificationUseCase(inMemoryRepository)
    })

    it('should be able to read a notification', async () => {
      const spySave = vi.spyOn(inMemoryRepository, 'save')

      inMemoryRepository.create(newNotification)

      const result = await sut.execute({
        recipientId: String(newNotification.recipientId),
        notificationId: String(newNotification.id),
      })

      expect(result.isRight()).toBeTruthy()
      expect(spySave).toBeCalled()

      expect(inMemoryRepository.items[0].readAt).toEqual(expect.any(Date))
    })
    it('should not be able to read an invalid notification', async () => {
      const spySave = vi.spyOn(inMemoryRepository, 'save')

      inMemoryRepository.create(newNotification)

      const result = await sut.execute({
        recipientId: String(newNotification.recipientId),
        notificationId: `not_${String(newNotification.id)}`,
      })

      expect(result.isLeft()).toBeTruthy()
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
      expect(spySave).not.toBeCalled()
      expect(fakeNotificationsRepository.save).not.toBeCalled()

      expect(inMemoryRepository.items[0].readAt).toEqual(undefined)
    })
    it('should not be able to read a notification from other user', async () => {
      const spySave = vi.spyOn(inMemoryRepository, 'save')

      inMemoryRepository.create(newNotification)

      const result = await sut.execute({
        recipientId: `not_${String(newNotification.recipientId)}`,
        notificationId: String(newNotification.id),
      })

      expect(result.isLeft()).toBeTruthy()
      expect(result.value).toBeInstanceOf(NotAllowedError)
      expect(spySave).not.toBeCalled()
      expect(fakeNotificationsRepository.save).not.toBeCalled()

      expect(inMemoryRepository.items[0].readAt).toEqual(undefined)
    })
  })
})
