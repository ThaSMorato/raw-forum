import { makeAnswer } from '$/factories/make-answer'
import {
  fakeAnswersRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer'

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

      try {
        await sut.execute({
          answerId: 'answer-1',
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
    })
    it('should throw if receives a not valid answer id', async () => {
      functions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
      }
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

      try {
        await sut.execute({
          answerId: 'answer-1',
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
        expect(spyDelete).not.toBeCalled()
      }
    })
    it('should throw if receives a not valid answer id', async () => {
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
        expect(spyDelete).not.toBeCalled()
      }
    })
  })
})
