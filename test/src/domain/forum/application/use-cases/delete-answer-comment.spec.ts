import { makeAnswerComment } from '$/factories/make-answer-comment'
import {
  fakeAnswerCommentsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answer-comments-repository'
import { InMemoryAnswerCommentsRepository } from '$/repositories/in-memory/in-memory-answer-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DeleteAnswerCommentUseCase } from '@/domain/forum/application/use-cases/delete-answer-comment'

let sut: DeleteAnswerCommentUseCase
let inMemoryRepository: InMemoryAnswerCommentsRepository

const newAnswerComment = makeAnswerComment(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('answer-comment-1'),
)

describe('Delete Answer Comment Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new DeleteAnswerCommentUseCase(fakeAnswerCommentsRepository)
    })
    it('should be able to delete a answer comment', async () => {
      functions.findById.mockResolvedValue(newAnswerComment)

      await sut.execute({
        answerCommentId: 'answer-comment-1',
        authorId: 'author-1',
      })

      expect(functions.findById).toBeCalled()
      expect(functions.delete).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newAnswerComment)

      try {
        await sut.execute({
          answerCommentId: 'answer-comment-1',
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
      expect(functions.delete).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      functions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          answerCommentId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer Comment not found')
      }
      expect(functions.delete).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryAnswerCommentsRepository()
      sut = new DeleteAnswerCommentUseCase(inMemoryRepository)
    })

    it('should be able to delete a answer comment', async () => {
      await inMemoryRepository.create(newAnswerComment)

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      await sut.execute({
        answerCommentId: 'answer-comment-1',
        authorId: 'author-1',
      })

      expect(spyFindById).toBeCalled()
      expect(spyDelete).toBeCalled()
      expect(inMemoryRepository.items).toHaveLength(0)
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newAnswerComment)

      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      try {
        await sut.execute({
          answerCommentId: 'answer-comment-1',
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
      expect(spyDelete).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      const spyDelete = vi.spyOn(inMemoryRepository, 'delete')

      try {
        await sut.execute({
          answerCommentId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer Comment not found')
      }
      expect(spyDelete).not.toBeCalled()
    })
  })
})