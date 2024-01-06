import { makeAnswer } from '$/factories/make-answer'
import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { makeInMemoryQuestionRepository } from '$/factories/make-in-memory-question-repository'
import { makeQuestion } from '$/factories/make-question'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { InMemoryNotificationsRepository } from '$/repositories/in-memory/in-memory-notifications-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { waitFor } from '$/utils/wait-for'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { OnAnswerCreated } from '@/domain/notification/application/subscribers/on-answer-created'
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '@/domain/notification/application/use-cases/send-notification'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { MockInstance } from 'vitest'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sendNotificationUseCase: SendNotificationUseCase
let inMemoryNotificationsRepository: InMemoryNotificationsRepository

let spyFindById: MockInstance<[string], Promise<Question | null>>
let spyExecute: MockInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>
let spyCreate: MockInstance<[notification: Notification], Promise<void>>

describe('On Answer Created Subscribe', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    )
    inMemoryQuestionsRepository = makeInMemoryQuestionRepository()
    inMemoryAnswersRepository = makeInMemoryAnswerRepository()

    spyFindById = vi.spyOn(inMemoryQuestionsRepository, 'findById')
    spyExecute = vi.spyOn(sendNotificationUseCase, 'execute')
    spyCreate = vi.spyOn(inMemoryNotificationsRepository, 'create')

    const _ = new OnAnswerCreated(
      inMemoryQuestionsRepository,
      sendNotificationUseCase,
    )
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send a notification when an answer is created', async () => {
    const newQuestion = makeQuestion()
    const answer = makeAnswer({
      questionId: newQuestion.id,
    })

    inMemoryQuestionsRepository.create(newQuestion)

    inMemoryAnswersRepository.create(answer)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).toHaveBeenCalled()
      expect(spyCreate).toHaveBeenCalled()
    })
  })

  it('should not send a notification when an answer is created to another question', async () => {
    const newQuestion = makeQuestion()
    const answer = makeAnswer({
      questionId: new UniqueEntityID(`not_${newQuestion.id}`),
    })

    inMemoryQuestionsRepository.create(newQuestion)

    inMemoryAnswersRepository.create(answer)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).not.toHaveBeenCalled()
      expect(spyCreate).not.toHaveBeenCalled()
    })
  })
})
