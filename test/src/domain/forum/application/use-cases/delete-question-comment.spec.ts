import { makeQuestionComment } from '$/factories/make-question-comment'
import {
  fakeQuestionCommentsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-question-comments-repository'
import { InMemoryQuestionCommentsRepository } from '$/repositories/in-memory/in-memory-question-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteQuestionCommentUseCase } from '@/domain/forum/application/use-cases/delete-question-comment'

let sut: DeleteQuestionCommentUseCase
let inMemoryRepository: InMemoryQuestionCommentsRepository

const newQuestionComment = makeQuestionComment(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('question-comment-1'),
)

describe('Delete Question Comment Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new DeleteQuestionCommentUseCase(fakeQuestionCommentsRepository)
    })
    it('should be able to delete a question comment', async () => {
      functions.findById.mockResolvedValue(newQuestionComment)

      await sut.execute({
        questionCommentId: 'question-comment-1',
        authorId: 'author-1',
      })

      expect(functions.findById).toBeCalled()
      expect(functions.delete).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newQuestionComment)

      try {
        await sut.execute({
          questionCommentId: 'question-comment-1',
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
      expect(functions.delete).not.toBeCalled()
    })
    it('should throw if receives a not valid question id', async () => {
      functions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          questionCommentId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question Comment not found')
      }
      expect(functions.delete).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryQuestionCommentsRepository()
      sut = new DeleteQuestionCommentUseCase(inMemoryRepository)
    })

    it('should be able to delete a question comment', async () => {
      await inMemoryRepository.create(newQuestionComment)

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      await sut.execute({
        questionCommentId: 'question-comment-1',
        authorId: 'author-1',
      })

      expect(spyFindById).toBeCalled()
      expect(spyDelete).toBeCalled()
      expect(inMemoryRepository.items).toHaveLength(0)
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newQuestionComment)

      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      try {
        await sut.execute({
          questionCommentId: 'question-comment-1',
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
      expect(spyDelete).not.toBeCalled()
    })
    it('should throw if receives a not valid question id', async () => {
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      try {
        await sut.execute({
          questionCommentId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question Comment not found')
      }
      expect(spyDelete).not.toBeCalled()
    })
  })
})