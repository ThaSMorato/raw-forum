import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { makeAnswer } from '$/factories/make-answer'
import { makeAnswerComment } from '$/factories/make-answer-comment'
import { InMemoryNotificationsRepository } from '$/repositories/in-memory/in-memory-notifications-repository'
import { InMemoryAnswerCommentsRepository } from '$/repositories/in-memory/in-memory-answer-comments-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { waitFor } from '$/utils/wait-for'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { OnNewAnswerComment } from '@/domain/notification/application/subscribers/on-new-answer-comment'
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '@/domain/notification/application/use-cases/send-notification'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { MockInstance } from 'vitest'

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let sendNotificationUseCase: SendNotificationUseCase
let inMemoryNotificationsRepository: InMemoryNotificationsRepository

let spyFindById: MockInstance<[string], Promise<Answer | null>>
let spyExecute: MockInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>
let spyCreate: MockInstance<[notification: Notification], Promise<void>>

describe('On Answer Best Answer Chosen Subscribe', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    )
    inMemoryAnswersRepository = makeInMemoryAnswerRepository()
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()

    spyFindById = vi.spyOn(inMemoryAnswersRepository, 'findById')
    spyExecute = vi.spyOn(sendNotificationUseCase, 'execute')
    spyCreate = vi.spyOn(inMemoryNotificationsRepository, 'create')

    // eslint-disable-next-line no-new
    new OnNewAnswerComment(inMemoryAnswersRepository, sendNotificationUseCase)
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send a notification when answer has a new comment', async () => {
    const newAnswer = makeAnswer()
    const newComment = makeAnswerComment({
      answerId: newAnswer.id,
    })

    inMemoryAnswersRepository.create(newAnswer)
    inMemoryAnswerCommentsRepository.create(newComment)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).toHaveBeenCalled()
      expect(spyCreate).toHaveBeenCalled()
    })
  })

  it('should not send a notification when another answer gets a new comment', async () => {
    const newAnswer = makeAnswer()
    const newComment = makeAnswerComment({
      answerId: new UniqueEntityID(`not_${newAnswer.id}`),
    })

    inMemoryAnswersRepository.create(newAnswer)
    inMemoryAnswerCommentsRepository.create(newComment)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).not.toHaveBeenCalled()
      expect(spyCreate).not.toHaveBeenCalled()
    })
  })
})
