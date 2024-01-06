import { makeInMemoryQuestionRepository } from '$/factories/make-in-memory-question-repository'
import { makeQuestion } from '$/factories/make-question'
import { makeQuestionComment } from '$/factories/make-question-comment'
import { InMemoryNotificationsRepository } from '$/repositories/in-memory/in-memory-notifications-repository'
import { InMemoryQuestionCommentsRepository } from '$/repositories/in-memory/in-memory-question-comments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { waitFor } from '$/utils/wait-for'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { OnNewQuestionComment } from '@/domain/notification/application/subscribers/on-new-question-comment'
import {
  SendNotificationUseCase,
  SendNotificationUseCaseRequest,
  SendNotificationUseCaseResponse,
} from '@/domain/notification/application/use-cases/send-notification'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { MockInstance } from 'vitest'

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sendNotificationUseCase: SendNotificationUseCase
let inMemoryNotificationsRepository: InMemoryNotificationsRepository

let spyFindById: MockInstance<[string], Promise<Question | null>>
let spyExecute: MockInstance<
  [SendNotificationUseCaseRequest],
  Promise<SendNotificationUseCaseResponse>
>
let spyCreate: MockInstance<[notification: Notification], Promise<void>>

describe('On Question Best Answer Chosen Subscribe', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    )
    inMemoryQuestionsRepository = makeInMemoryQuestionRepository()
    inMemoryQuestionCommentsRepository =
      new InMemoryQuestionCommentsRepository()

    spyFindById = vi.spyOn(inMemoryQuestionsRepository, 'findById')
    spyExecute = vi.spyOn(sendNotificationUseCase, 'execute')
    spyCreate = vi.spyOn(inMemoryNotificationsRepository, 'create')

    // eslint-disable-next-line no-new
    new OnNewQuestionComment(
      inMemoryQuestionsRepository,
      sendNotificationUseCase,
    )
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send a notification when question has a new comment', async () => {
    const newQuestion = makeQuestion()
    const newComment = makeQuestionComment({
      questionId: newQuestion.id,
    })

    inMemoryQuestionsRepository.create(newQuestion)
    inMemoryQuestionCommentsRepository.create(newComment)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).toHaveBeenCalled()
      expect(spyCreate).toHaveBeenCalled()
    })
  })

  it('should not send a notification when another question gets a new comment', async () => {
    const newQuestion = makeQuestion()
    const newComment = makeQuestionComment({
      questionId: new UniqueEntityID(`not_${newQuestion.id}`),
    })

    inMemoryQuestionsRepository.create(newQuestion)
    inMemoryQuestionCommentsRepository.create(newComment)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).not.toHaveBeenCalled()
      expect(spyCreate).not.toHaveBeenCalled()
    })
  })
})
