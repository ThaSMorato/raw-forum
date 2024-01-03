import { fakeAnswersRepository } from '$/repositories/fake-repositories/fake-answer-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
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
      const { answer } = await sut.execute({
        content: 'Nova Resposta',
        instructorId: '1',
        questionId: '1',
      })

      expect(answer.content).toEqual('Nova Resposta')
      expect(answer.authorId.toValue()).toEqual('1')
      expect(answer.questionId.toValue()).toEqual('1')

      expect(fakeAnswersRepository.create).toBeCalled()
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryAnswersRepository()
      sut = new AnswerQuestionUseCase(inMemoryRepository)
    })
    it('should be able to answer a question', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')

      const { answer } = await sut.execute({
        content: 'Nova Resposta',
        instructorId: '1',
        questionId: '1',
      })

      expect(answer.content).toEqual('Nova Resposta')
      expect(answer.authorId.toValue()).toEqual('1')
      expect(answer.questionId.toValue()).toEqual('1')

      expect(spyCreate).toBeCalled()

      expect(inMemoryRepository.items.length).toEqual(1)
      expect(inMemoryRepository.items[0].id).toEqual(answer.id)
    })
  })
})
