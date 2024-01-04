import { makeQuestionComment } from '$/factories/make-question-comment'
import {
  fakeQuestionCommentsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-question-comments-repository'
import { InMemoryQuestionCommentsRepository } from '$/repositories/in-memory/in-memory-question-comments-repository'
import { Right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments'

let sut: FetchQuestionCommentsUseCase
let inMemoryRepository: InMemoryQuestionCommentsRepository

describe('Fetch Question Comments Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchQuestionCommentsUseCase(fakeQuestionCommentsRepository)
    })
    it('should be able to fetch question`s comments', async () => {
      const respose = [makeQuestionComment()]
      functions.findManyByQuestionId.mockResolvedValue(respose)

      const response = await sut.execute({
        page: 1,
        questionId: 'question-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.questionComments).toHaveLength(1)
      expect(response.value?.questionComments).toBe(respose)

      expect(functions.findManyByQuestionId).toBeCalled()
      expect(functions.findManyByQuestionId).toBeCalledWith('question-1', {
        page: 1,
      })
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryQuestionCommentsRepository()
      sut = new FetchQuestionCommentsUseCase(inMemoryRepository)
    })

    it('should be able to fetch question`s questionComments', async () => {
      await inMemoryRepository.create(
        makeQuestionComment({ questionId: new UniqueEntityID('question-1') }),
      )
      await inMemoryRepository.create(
        makeQuestionComment({ questionId: new UniqueEntityID('question-1') }),
      )
      await inMemoryRepository.create(
        makeQuestionComment({ questionId: new UniqueEntityID('question-1') }),
      )

      const spyFindManyByQuestionId = vi.spyOn(
        inMemoryRepository,
        'findManyByQuestionId',
      )

      const response = await sut.execute({
        page: 1,
        questionId: 'question-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.questionComments).toEqual([
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
      ])
      expect(response.value?.questionComments).toHaveLength(3)

      expect(spyFindManyByQuestionId).toBeCalled()
    })

    it('should be able to fetch paginated question`s questionComments', async () => {
      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeQuestionComment({ questionId: new UniqueEntityID('question-1') }),
        )
      }
      const spyFindManyByQuestionId = vi.spyOn(
        inMemoryRepository,
        'findManyByQuestionId',
      )

      const response = await sut.execute({
        page: 2,
        questionId: 'question-1',
      })

      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.questionComments).toEqual([
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
      ])

      expect(response.value?.questionComments).toHaveLength(2)

      expect(spyFindManyByQuestionId).toBeCalled()
    })
  })
})
