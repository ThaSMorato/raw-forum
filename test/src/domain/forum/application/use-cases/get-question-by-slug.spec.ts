import { fakeQuestionsRepository } from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'

let sut: GetQuestionBySlugUseCase
let inMemoryRepository: InMemoryQuestionsRepository

const returnedQuestion = Question.create({
  authorId: new UniqueEntityID('1'),
  content: 'A new question content',
  title: 'A test slug',
  slug: Slug.create('a-test-slug'),
})

const mockFindBySlug = vi.fn()

const mockedRepository = {
  ...fakeQuestionsRepository,
  findBySlug: mockFindBySlug,
}

describe('Get Question By Slug Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new GetQuestionBySlugUseCase(mockedRepository)
    })
    it('should be able to find a question by slug', async () => {
      mockFindBySlug.mockResolvedValue(returnedQuestion)

      const { question } = await sut.execute({
        slug: 'a-test-slug',
      })

      expect(question.title).toEqual(returnedQuestion.title)
      expect(question.slug.value).toEqual(returnedQuestion.slug.value)
      expect(question.authorId.toValue()).toEqual(
        returnedQuestion.authorId.toValue(),
      )
      expect(question.content).toEqual(returnedQuestion.content)
      expect(question.id.toValue()).toEqual(returnedQuestion.id.toValue())

      expect(mockFindBySlug).toBeCalled()
    })
    it('should throw if receives a not valid question slug', async () => {
      mockFindBySlug.mockResolvedValue(null)

      try {
        await sut.execute({
          slug: 'a-not-valid-test-slug',
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
      sut = new GetQuestionBySlugUseCase(inMemoryRepository)
    })

    it('should be able to find a question by slug', async () => {
      await inMemoryRepository.create(returnedQuestion)

      const spyFindBySlug = vi.spyOn(inMemoryRepository, 'findBySlug')

      const { question } = await sut.execute({
        slug: returnedQuestion.slug.value,
      })

      expect(question.title).toEqual(returnedQuestion.title)
      expect(question.slug.value).toEqual(returnedQuestion.slug.value)
      expect(question.authorId.toValue()).toEqual(
        returnedQuestion.authorId.toValue(),
      )
      expect(question.content).toEqual(returnedQuestion.content)
      expect(question.id.toValue()).toEqual(returnedQuestion.id.toValue())

      expect(spyFindBySlug).toBeCalled()
    })

    it('should throw if receives a not valid question slug', async () => {
      try {
        await sut.execute({
          slug: 'a-not-valid-test-slug',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question not found')
      }
    })
  })
})
