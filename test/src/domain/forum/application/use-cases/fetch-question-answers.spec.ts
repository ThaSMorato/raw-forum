import { makeAnswer } from '$/factories/make-answer'
import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import {
  fakeAnswersRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { Right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers'

let sut: FetchQuestionAnswersUseCase
let inMemoryRepository: InMemoryAnswersRepository

describe('Fetch Question Answers Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchQuestionAnswersUseCase(fakeAnswersRepository)
    })
    it('should be able to fetch question`s answers', async () => {
      const respose = [makeAnswer()]
      functions.findManyByQuestionId.mockResolvedValue(respose)

      const response = await sut.execute({
        page: 1,
        questionId: 'question-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      expect(response.value?.answers).toHaveLength(1)
      expect(response.value?.answers).toBe(respose)

      expect(functions.findManyByQuestionId).toBeCalled()
      expect(functions.findManyByQuestionId).toBeCalledWith('question-1', {
        page: 1,
      })
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = makeInMemoryAnswerRepository()
      sut = new FetchQuestionAnswersUseCase(inMemoryRepository)
    })

    it('should be able to fetch question`s answers', async () => {
      await inMemoryRepository.create(
        makeAnswer({ questionId: new UniqueEntityID('question-1') }),
      )
      await inMemoryRepository.create(
        makeAnswer({ questionId: new UniqueEntityID('question-1') }),
      )
      await inMemoryRepository.create(
        makeAnswer({ questionId: new UniqueEntityID('question-1') }),
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

      expect(response.value?.answers).toEqual([
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

      expect(response.value?.answers).toHaveLength(3)

      expect(spyFindManyByQuestionId).toBeCalled()
    })

    it('should be able to fetch paginated question`s answers', async () => {
      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeAnswer({ questionId: new UniqueEntityID('question-1') }),
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

      expect(response.value?.answers).toEqual([
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
        expect.objectContaining({
          questionId: new UniqueEntityID('question-1'),
        }),
      ])

      expect(response.value?.answers).toHaveLength(2)

      expect(spyFindManyByQuestionId).toBeCalled()
    })
  })
})
