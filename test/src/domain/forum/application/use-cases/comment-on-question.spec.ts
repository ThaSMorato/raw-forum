import { makeInMemoryQuestionRepository } from '$/factories/make-in-memory-question-repository'
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
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

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

      const response = await sut.execute({
        questionId: String(newQuestion.id),
        authorId: 'author-1',
        content: 'content',
      })

      expect(questionFunctions.findById).toBeCalled()
      expect(commentFunctions.create).toBeCalled()
      expect(response.isRight()).toBeTruthy()
      if (response.isRight()) {
        expect(response.value.questionComment.questionId).toStrictEqual(
          newQuestion.id,
        )
      }
    })
    it('should throw if receives a not valid question id', async () => {
      questionFunctions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        questionId: 'a-not-valid-id',
        authorId: 'author-1',
        content: 'content',
      })
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(response.isLeft()).toBeTruthy()
      expect(commentFunctions.create).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryQuestionCommentsRepository =
        new InMemoryQuestionCommentsRepository()
      inMemoryQuestionsRepository = makeInMemoryQuestionRepository()
      sut = new CommentOnQuestionUseCase(
        inMemoryQuestionsRepository,
        inMemoryQuestionCommentsRepository,
      )
    })

    it('should be able to comment on question', async () => {
      await inMemoryQuestionsRepository.create(newQuestion)

      const spyCreate = vi.spyOn(inMemoryQuestionCommentsRepository, 'create')

      const response = await sut.execute({
        questionId: String(newQuestion.id),
        authorId: 'author-1',
        content: 'new comment on question',
      })

      expect(spyCreate).toBeCalled()
      expect(response.isRight()).toBeTruthy()
      if (response.isRight()) {
        expect(response.value.questionComment.questionId).toStrictEqual(
          newQuestion.id,
        )
      }
    })
    it('should throw if receives a not valid question id', async () => {
      await inMemoryQuestionsRepository.create(newQuestion)
      const spyCreate = vi.spyOn(inMemoryQuestionCommentsRepository, 'create')

      const response = await sut.execute({
        questionId: `not_${newQuestion.id}`,
        authorId: 'author-1',
        content: 'new comment on question',
      })

      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(response.isLeft()).toBeTruthy()
      expect(spyCreate).not.toBeCalled()
    })
  })
})
