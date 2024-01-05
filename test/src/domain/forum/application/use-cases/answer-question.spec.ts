import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { fakeAnswersRepository } from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

let sut: AnswerQuestionUseCase
let inMemoryRepository: InMemoryAnswersRepository

describe('Answer Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unit Tests', () => {
    beforeEach(() => {
      sut = new AnswerQuestionUseCase(fakeAnswersRepository)
    })

    it('should be able to answer a question', async () => {
      const result = await sut.execute({
        content: 'Nova Resposta',
        instructorId: '1',
        questionId: '1',
        attachmentsIds: [],
      })

      expect(result.isRight()).toBeTruthy()

      expect(result.value?.answer.content).toEqual('Nova Resposta')
      expect(result.value?.answer.authorId.toValue()).toEqual('1')
      expect(result.value?.answer.questionId.toValue()).toEqual('1')

      expect(fakeAnswersRepository.create).toBeCalled()
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      inMemoryRepository = makeInMemoryAnswerRepository()
      sut = new AnswerQuestionUseCase(inMemoryRepository)
    })
    it('should be able to answer a question', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')

      const result = await sut.execute({
        content: 'Nova Resposta',
        instructorId: '1',
        questionId: '1',
        attachmentsIds: ['1', '2'],
      })

      expect(result.isRight()).toBeTruthy()
      expect(result.value?.answer.content).toEqual('Nova Resposta')
      expect(result.value?.answer.authorId.toValue()).toEqual('1')
      expect(result.value?.answer.questionId.toValue()).toEqual('1')
      expect(inMemoryRepository.items[0].id).toEqual(result.value?.answer.id)

      expect(spyCreate).toBeCalled()

      expect(inMemoryRepository.items.length).toEqual(1)

      expect(inMemoryRepository.items[0].attachments.currentItems).toHaveLength(
        2,
      )
      expect(inMemoryRepository.items[0].attachments.currentItems).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
      ])
    })
  })
})
