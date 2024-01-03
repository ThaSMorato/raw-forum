import { makeQuestion } from '$/factories/make-question'
import { fakeQuestionsRepository } from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'

let sut: GetQuestionBySlugUseCase
let inMemoryRepository: InMemoryQuestionsRepository

const newQuestion = makeQuestion({
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
      mockFindBySlug.mockResolvedValue(newQuestion)

      const { question } = await sut.execute({
        slug: 'a-test-slug',
      })

      expect(question.title).toEqual(newQuestion.title)
      expect(question.slug.value).toEqual(newQuestion.slug.value)
      expect(question.authorId.toValue()).toEqual(
        newQuestion.authorId.toValue(),
      )
      expect(question.content).toEqual(newQuestion.content)
      expect(question.id.toValue()).toEqual(newQuestion.id.toValue())

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
      await inMemoryRepository.create(newQuestion)

      const spyFindBySlug = vi.spyOn(inMemoryRepository, 'findBySlug')

      const { question } = await sut.execute({
        slug: newQuestion.slug.value,
      })

      expect(question.title).toEqual(newQuestion.title)
      expect(question.slug.value).toEqual(newQuestion.slug.value)
      expect(question.authorId.toValue()).toEqual(
        newQuestion.authorId.toValue(),
      )
      expect(question.content).toEqual(newQuestion.content)
      expect(question.id.toValue()).toEqual(newQuestion.id.toValue())

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
