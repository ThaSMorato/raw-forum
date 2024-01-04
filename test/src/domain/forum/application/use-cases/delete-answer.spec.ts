import { makeAnswer } from '$/factories/make-answer'
import {
  fakeAnswersRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { Left } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer'
import { NotAllowedError } from '@/domain/forum/application/use-cases/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/domain/forum/application/use-cases/errors/resource-not-found-error'

let sut: DeleteAnswerUseCase
let inMemoryRepository: InMemoryAnswersRepository

const newAnswer = makeAnswer(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('answer-1'),
)

describe('Delete Answer Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new DeleteAnswerUseCase(fakeAnswersRepository)
    })
    it('should be able to delete a answer', async () => {
      functions.findById.mockResolvedValue(newAnswer)

      await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-1',
      })

      expect(functions.findById).toBeCalled()
      expect(functions.delete).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newAnswer)

      const response = await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-2',
      })

      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
    })
    it('should throw if receives a not valid answer id', async () => {
      functions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
      })

      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryAnswersRepository()
      sut = new DeleteAnswerUseCase(inMemoryRepository)
    })

    it('should be able to delete a answer', async () => {
      await inMemoryRepository.create(newAnswer)

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-1',
      })

      expect(spyFindById).toBeCalled()
      expect(spyDelete).toBeCalled()
      expect(inMemoryRepository.items.length).toBe(0)
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newAnswer)

      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      const response = await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-2',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(spyDelete).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(spyDelete).not.toBeCalled()
    })
  })
})
