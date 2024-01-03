import { fakeQuestionsRepository } from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'

let sut: CreateQuestionUseCase
let inMemoryRepository: InMemoryQuestionsRepository

describe('Create Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new CreateQuestionUseCase(fakeQuestionsRepository)
    })
    it('should be able to create a question', async () => {
      const { question } = await sut.execute({
        authorId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
      })

      expect(question.title).toEqual('Nova pergunta')
      expect(question.slug.value).toEqual('nova-pergunta')
      expect(question.authorId.toValue()).toEqual('1')
      expect(question.content).toEqual('Conteúdo da nova pergunta')
      expect(question.id.toValue()).toEqual(expect.any(String))

      expect(fakeQuestionsRepository.create).toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryQuestionsRepository()
      sut = new CreateQuestionUseCase(inMemoryRepository)
    })

    it('should be able to create a question', async () => {
      const spyCreate = vi.spyOn(inMemoryRepository, 'create')

      const { question } = await sut.execute({
        authorId: '1',
        title: 'Nova pergunta',
        content: 'Conteúdo da nova pergunta',
      })

      expect(question.title).toEqual('Nova pergunta')
      expect(question.slug.value).toEqual('nova-pergunta')
      expect(question.authorId.toValue()).toEqual('1')
      expect(question.content).toEqual('Conteúdo da nova pergunta')
      expect(question.id.toValue()).toEqual(expect.any(String))

      expect(spyCreate).toBeCalled()

      expect(inMemoryRepository.items[0].id).toEqual(question.id)
      expect(inMemoryRepository.items.length).toEqual(1)
    })
  })
})
