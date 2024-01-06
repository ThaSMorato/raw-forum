import { makeAnswer } from '$/factories/make-answer'
import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { makeInMemoryQuestionRepository } from '$/factories/make-in-memory-question-repository'
import { makeQuestion } from '$/factories/make-question'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { InMemoryNotificationsRepository } from '$/repositories/in-memory/in-memory-notifications-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { waitFor } from '$/utils/wait-for'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { OnQuestionBestAnswerChosen } from '@/domain/notification/application/subscribers/on-question-best-answer-chosen'
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

let spyFindById: MockInstance<[string], Promise<Answer | null>>
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
    inMemoryAnswersRepository = makeInMemoryAnswerRepository()

    spyFindById = vi.spyOn(inMemoryAnswersRepository, 'findById')
    spyExecute = vi.spyOn(sendNotificationUseCase, 'execute')
    spyCreate = vi.spyOn(inMemoryNotificationsRepository, 'create')

    // eslint-disable-next-line no-new
    new OnQuestionBestAnswerChosen(
      inMemoryAnswersRepository,
      sendNotificationUseCase,
    )
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send a notification when question has a new best answer', async () => {
    const newQuestion = makeQuestion()
    const answer = makeAnswer({
      questionId: newQuestion.id,
    })

    inMemoryQuestionsRepository.create(newQuestion)

    inMemoryAnswersRepository.create(answer)

    newQuestion.bestAnswerId = answer.id

    inMemoryQuestionsRepository.save(newQuestion)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).toHaveBeenCalled()
      expect(spyCreate).toHaveBeenCalled()
    })
  })

  it('should not send a notification when another question gets a best answer', async () => {
    const newQuestion = makeQuestion()
    const answer = makeAnswer({
      questionId: newQuestion.id,
    })

    inMemoryQuestionsRepository.create(newQuestion)

    inMemoryAnswersRepository.create(answer)

    newQuestion.bestAnswerId = new UniqueEntityID(`not_${answer.id}`)

    inMemoryQuestionsRepository.save(newQuestion)

    await waitFor(() => {
      expect(spyFindById).toHaveBeenCalled()
      expect(spyExecute).not.toHaveBeenCalled()
      expect(spyCreate).not.toHaveBeenCalled()
    })
  })
})
