import { makeAnswer } from '$/factories/make-answer'
import {
  fakeAnswersRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'

let sut: EditAnswerUseCase
let inMemoryRepository: InMemoryAnswersRepository

const newAnswer = makeAnswer(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('answer-1'),
)

describe('Edit Answer Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new EditAnswerUseCase(fakeAnswersRepository)
    })
    it('should be able to Edit a answer', async () => {
      functions.findById.mockResolvedValue(newAnswer)

      await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-1',
        content: 'new content',
      })

      expect(functions.findById).toBeCalled()
      expect(functions.save).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newAnswer)

      try {
        await sut.execute({
          answerId: 'answer-1',
          authorId: 'author-2',
          content: 'new content',
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
          content: 'new content',
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
      sut = new EditAnswerUseCase(inMemoryRepository)
    })

    it('should be able to Edit a answer', async () => {
      await inMemoryRepository.create(newAnswer)

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-1',
        content: 'new content',
      })

      expect(spyFindById).toBeCalled()
      expect(spyEdit).toBeCalled()
      expect(inMemoryRepository.items.length).toBe(1)
      expect(inMemoryRepository.items[0]).toMatchObject({
        content: 'new content',
      })
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newAnswer)

      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      try {
        await sut.execute({
          answerId: 'answer-1',
          authorId: 'author-2',
          content: 'new content',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
        expect(spyEdit).not.toBeCalled()
      }
    })
    it('should throw if receives a not valid answer id', async () => {
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
          content: 'new content',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
        expect(spyEdit).not.toBeCalled()
      }
    })
  })
})
