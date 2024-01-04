import { makeAnswer } from '$/factories/make-answer'
import {
  fakeAnswerCommentsRepository,
  functions as commentFunctions,
} from '$/repositories/fake-repositories/fake-answer-comments-repository'
import {
  fakeAnswersRepository,
  functions as answerFunctions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswerCommentsRepository } from '$/repositories/in-memory/in-memory-answer-comments-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer'

let sut: CommentOnAnswerUseCase
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository

const newAnswer = makeAnswer({
  authorId: new UniqueEntityID('author-1'),
})

describe('Comment on Answer Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new CommentOnAnswerUseCase(
        fakeAnswersRepository,
        fakeAnswerCommentsRepository,
      )
    })
    it('should be able to comment on answer', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)

      const { answerComment } = await sut.execute({
        answerId: String(newAnswer.id),
        authorId: 'author-1',
        content: 'content',
      })

      expect(answerFunctions.findById).toBeCalled()
      expect(commentFunctions.create).toBeCalled()
      expect(answerComment.answerId).toStrictEqual(newAnswer.id)
    })
    it('should throw if receives a not valid answer id', async () => {
      answerFunctions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
          content: 'content',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
      }
      expect(commentFunctions.create).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()
      inMemoryAnswersRepository = new InMemoryAnswersRepository()
      sut = new CommentOnAnswerUseCase(
        inMemoryAnswersRepository,
        inMemoryAnswerCommentsRepository,
      )
    })

    it('should be able to comment on answer', async () => {
      await inMemoryAnswersRepository.create(newAnswer)

      const spyCreate = vi.spyOn(inMemoryAnswerCommentsRepository, 'create')

      const { answerComment } = await sut.execute({
        answerId: String(newAnswer.id),
        authorId: 'author-1',
        content: 'new comment on answer',
      })

      expect(spyCreate).toBeCalled()
      expect(answerComment.answerId).toStrictEqual(newAnswer.id)
    })
    it('should throw if receives a not valid answer id', async () => {
      await inMemoryAnswersRepository.create(newAnswer)
      const spyCreate = vi.spyOn(inMemoryAnswerCommentsRepository, 'create')

      try {
        await sut.execute({
          answerId: `not_${newAnswer.id}`,
          authorId: 'author-1',
          content: 'new comment on answer',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
      }
      expect(spyCreate).not.toBeCalled()
    })
  })
})
