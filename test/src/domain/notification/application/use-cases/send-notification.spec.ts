import { fakeNotificationsRepository } from '$/repositories/fake-repositories/fake-notification-repository'
import { InMemoryNotificationsRepository } from '$/repositories/in-memory/in-memory-notifications-repository'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification'

let sut: SendNotificationUseCase
let inMemoryRepository: InMemoryNotificationsRepository

describe('Create Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new SendNotificationUseCase(fakeNotificationsRepository)
    })
    it('should be able to create a question', async () => {
      const response = await sut.execute({
        recipientId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
      })

      expect(response.isRight()).toBeTruthy()

      expect(response.value?.notification.title).toEqual('Nova pergunta')
      expect(response.value?.notification.recipientId.toValue()).toEqual('1')
      expect(response.value?.notification.content).toEqual(
        'Conteúdo da nova pergunta',
      )
      expect(response.value?.notification.id.toValue()).toEqual(
        expect.any(String),
      )

      expect(fakeNotificationsRepository.create).toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryNotificationsRepository()
      sut = new SendNotificationUseCase(inMemoryRepository)
    })

    it('should be able to create a notification', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')

      const response = await sut.execute({
        recipientId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
      })

      expect(response.isRight()).toBeTruthy()

      expect(response.value?.notification.title).toEqual('Nova pergunta')
      expect(response.value?.notification.recipientId.toValue()).toEqual('1')
      expect(response.value?.notification.content).toEqual(
        'Conteúdo da nova pergunta',
      )
      expect(response.value?.notification.id.toValue()).toEqual(
        expect.any(String),
      )
      expect(inMemoryRepository.items[0].id).toEqual(
        response.value?.notification.id,
      )

      expect(spyCreate).toBeCalled()

      expect(inMemoryRepository.items.length).toEqual(1)
    })
  })
})
