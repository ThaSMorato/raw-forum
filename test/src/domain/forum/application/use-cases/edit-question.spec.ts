import { makeQuestion } from '$/factories/make-question'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question'

let sut: EditQuestionUseCase
let inMemoryRepository: InMemoryQuestionsRepository

const newQuestion = makeQuestion(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('question-1'),
)

describe('Edit Question Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new EditQuestionUseCase(fakeQuestionsRepository)
    })
    it('should be able to Edit a question', async () => {
      functions.findById.mockResolvedValue(newQuestion)

      await sut.execute({
        questionId: 'question-1',
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
      })

      expect(functions.findById).toBeCalled()
      expect(functions.save).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newQuestion)

      try {
        await sut.execute({
          questionId: 'question-1',
          authorId: 'author-2',
          content: 'new content',
          title: 'new title',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
    })
    it('should throw if receives a not valid question id', async () => {
      functions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          questionId: 'a-not-valid-id',
          authorId: 'author-1',
          content: 'new content',
          title: 'new title',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question not found')
      }
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryQuestionsRepository()
      sut = new EditQuestionUseCase(inMemoryRepository)
    })

    it('should be able to Edit a question', async () => {
      await inMemoryRepository.create(newQuestion)

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      await sut.execute({
        questionId: 'question-1',
        authorId: 'author-1',
        content: 'new content',
        title: 'new title',
      })

      expect(spyFindById).toBeCalled()
      expect(spyEdit).toBeCalled()
      expect(inMemoryRepository.items.length).toBe(1)
      expect(inMemoryRepository.items[0]).toMatchObject({
        content: 'new content',
        title: 'new title',
      })
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newQuestion)

      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      try {
        await sut.execute({
          questionId: 'question-1',
          authorId: 'author-2',
          content: 'new content',
          title: 'new title',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
        expect(spyEdit).not.toBeCalled()
      }
    })
    it('should throw if receives a not valid question id', async () => {
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      try {
        await sut.execute({
          questionId: 'a-not-valid-id',
          authorId: 'author-1',
          content: 'new content',
          title: 'new title',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question not found')
        expect(spyEdit).not.toBeCalled()
      }
    })
  })
})