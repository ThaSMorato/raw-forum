import { makeQuestion } from '$/factories/make-question'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { Left } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question'
import { NotAllowedError } from '@/domain/forum/application/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/domain/forum/application/use-cases/errors/resource-not-found-error'

let sut: DeleteQuestionUseCase
let inMemoryRepository: InMemoryQuestionsRepository

const newQuestion = makeQuestion(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('question-1'),
)

describe('Delete Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new DeleteQuestionUseCase(fakeQuestionsRepository)
    })
    it('should be able to delete a question', async () => {
      functions.findById.mockResolvedValue(newQuestion)

      await sut.execute({
        questionId: 'question-1',
        authorId: 'author-1',
      })

      expect(functions.findById).toBeCalled()
      expect(functions.delete).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newQuestion)

      const response = await sut.execute({
        questionId: 'question-1',
        authorId: 'author-2',
      })

      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
    })
    it('should throw if receives a not valid question id', async () => {
      functions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        questionId: 'a-not-valid-id',
        authorId: 'author-1',
      })

      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryQuestionsRepository()
      sut = new DeleteQuestionUseCase(inMemoryRepository)
    })

    it('should be able to delete a question', async () => {
      await inMemoryRepository.create(newQuestion)

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      await sut.execute({
        questionId: 'question-1',
        authorId: 'author-1',
      })

      expect(spyFindById).toBeCalled()
      expect(spyDelete).toBeCalled()
      expect(inMemoryRepository.items.length).toBe(0)
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newQuestion)

      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      const response = await sut.execute({
        questionId: 'question-1',
        authorId: 'author-2',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(spyDelete).not.toBeCalled()
    })
    it('should throw if receives a not valid question id', async () => {
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      const response = await sut.execute({
        questionId: 'a-not-valid-id',
        authorId: 'author-1',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(spyDelete).not.toBeCalled()
    })
  })
})
