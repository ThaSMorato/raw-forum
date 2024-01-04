import { makeAnswerComment } from '$/factories/make-answer-comment'
import {
  fakeAnswerCommentsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answer-comments-repository'
import { InMemoryAnswerCommentsRepository } from '$/repositories/in-memory/in-memory-answer-comments-repository'
import { Right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments'

let sut: FetchAnswerCommentsUseCase
let inMemoryRepository: InMemoryAnswerCommentsRepository

describe('Fetch Answer Comments Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchAnswerCommentsUseCase(fakeAnswerCommentsRepository)
    })
    it('should be able to fetch answer`s comments', async () => {
      const respose = [makeAnswerComment()]
      functions.findManyByAnswerId.mockResolvedValue(respose)

      const response = await sut.execute({
        page: 1,
        answerId: 'answer-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      if (response.isRight()) {
        const { answerComments } = response.value
        expect(answerComments).toHaveLength(1)
        expect(answerComments).toBe(respose)
      }
      expect(functions.findManyByAnswerId).toBeCalled()
      expect(functions.findManyByAnswerId).toBeCalledWith('answer-1', {
        page: 1,
      })
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryAnswerCommentsRepository()
      sut = new FetchAnswerCommentsUseCase(inMemoryRepository)
    })

    it('should be able to fetch answer`s answerComments', async () => {
      await inMemoryRepository.create(
        makeAnswerComment({ answerId: new UniqueEntityID('answer-1') }),
      )
      await inMemoryRepository.create(
        makeAnswerComment({ answerId: new UniqueEntityID('answer-1') }),
      )
      await inMemoryRepository.create(
        makeAnswerComment({ answerId: new UniqueEntityID('answer-1') }),
      )

      const spyFindManyByAnswerId = vi.spyOn(
        inMemoryRepository,
        'findManyByAnswerId',
      )

      const response = await sut.execute({
        page: 1,
        answerId: 'answer-1',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      if (response.isRight()) {
        const { answerComments } = response.value

        expect(answerComments).toEqual([
          expect.objectContaining({
            answerId: new UniqueEntityID('answer-1'),
          }),
          expect.objectContaining({
            answerId: new UniqueEntityID('answer-1'),
          }),
          expect.objectContaining({
            answerId: new UniqueEntityID('answer-1'),
          }),
        ])
        expect(answerComments).toHaveLength(3)
      }

      expect(spyFindManyByAnswerId).toBeCalled()
    })

    it('should be able to fetch paginated answer`s answerComments', async () => {
      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeAnswerComment({ answerId: new UniqueEntityID('answer-1') }),
        )
      }
      const spyFindManyByAnswerId = vi.spyOn(
        inMemoryRepository,
        'findManyByAnswerId',
      )

      const response = await sut.execute({
        page: 2,
        answerId: 'answer-1',
      })

      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      if (response.isRight()) {
        const { answerComments } = response.value
        expect(answerComments).toEqual([
          expect.objectContaining({
            answerId: new UniqueEntityID('answer-1'),
          }),
          expect.objectContaining({
            answerId: new UniqueEntityID('answer-1'),
          }),
        ])

        expect(answerComments).toHaveLength(2)
      }

      expect(spyFindManyByAnswerId).toBeCalled()
    })
  })
})
