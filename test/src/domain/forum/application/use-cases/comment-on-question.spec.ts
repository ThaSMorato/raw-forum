import { makeQuestion } from '$/factories/make-question'
import {
  fakeQuestionCommentsRepository,
  functions as commentFunctions,
} from '$/repositories/fake-repositories/fake-question-comments-repository'
import {
  fakeQuestionsRepository,
  functions as questionFunctions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionCommentsRepository } from '$/repositories/in-memory/in-memory-question-comments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question'

let sut: CommentOnQuestionUseCase
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository

const newQuestion = makeQuestion({
  authorId: new UniqueEntityID('author-1'),
})

describe('Comment on Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new CommentOnQuestionUseCase(
        fakeQuestionsRepository,
        fakeQuestionCommentsRepository,
      )
    })
    it('should be able to comment on question', async () => {
      questionFunctions.findById.mockResolvedValue(newQuestion)

      const { questionComment } = await sut.execute({
        questionId: String(newQuestion.id),
        authorId: 'author-1',
        content: 'content',
      })

      expect(questionFunctions.findById).toBeCalled()
      expect(commentFunctions.create).toBeCalled()
      expect(questionComment.questionId).toStrictEqual(newQuestion.id)
    })
    it('should throw if receives a not valid question id', async () => {
      questionFunctions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          questionId: 'a-not-valid-id',
          authorId: 'author-1',
          content: 'content',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question not found')
      }
      expect(commentFunctions.create).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryQuestionCommentsRepository =
        new InMemoryQuestionCommentsRepository()
      inMemoryQuestionsRepository = new InMemoryQuestionsRepository()
      sut = new CommentOnQuestionUseCase(
        inMemoryQuestionsRepository,
        inMemoryQuestionCommentsRepository,
      )
    })

    it('should be able to comment on question', async () => {
      await inMemoryQuestionsRepository.create(newQuestion)

      const spyCreate = vi.spyOn(inMemoryQuestionCommentsRepository, 'create')

      const { questionComment } = await sut.execute({
        questionId: String(newQuestion.id),
        authorId: 'author-1',
        content: 'new comment on question',
      })

      expect(spyCreate).toBeCalled()
      expect(questionComment.questionId).toStrictEqual(newQuestion.id)
    })
    it('should throw if receives a not valid question id', async () => {
      await inMemoryQuestionsRepository.create(newQuestion)
      const spyCreate = vi.spyOn(inMemoryQuestionCommentsRepository, 'create')

      try {
        await sut.execute({
          questionId: `not_${newQuestion.id}`,
          authorId: 'author-1',
          content: 'new comment on question',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question not found')
      }
      expect(spyCreate).not.toBeCalled()
    })
  })
})
