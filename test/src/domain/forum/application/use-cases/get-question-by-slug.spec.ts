import { makeQuestion } from '$/factories/make-question'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { Left, Right } from '@/core/either'
import { ResourceNotFoundError } from '@/domain/forum/application/use-cases/errors/resource-not-found-error'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'

let sut: GetQuestionBySlugUseCase
let inMemoryRepository: InMemoryQuestionsRepository

const newQuestion = makeQuestion({
  slug: Slug.create('a-test-slug'),
})

describe('Get Question By Slug Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new GetQuestionBySlugUseCase(fakeQuestionsRepository)
    })
    it('should be able to find a question by slug', async () => {
      functions.findBySlug.mockResolvedValue(newQuestion)

      const response = await sut.execute({
        slug: 'a-test-slug',
      })
      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      if (response.isRight()) {
        const { question } = response.value
        expect(question.title).toEqual(newQuestion.title)
        expect(question.slug.value).toEqual(newQuestion.slug.value)
        expect(question.authorId.toValue()).toEqual(
          newQuestion.authorId.toValue(),
        )
        expect(question.content).toEqual(newQuestion.content)
        expect(question.id.toValue()).toEqual(newQuestion.id.toValue())
      }
      expect(functions.findBySlug).toBeCalled()
    })
    it('should throw if receives a not valid question slug', async () => {
      functions.findBySlug.mockResolvedValue(null)

      const response = await sut.execute({
        slug: 'a-not-valid-test-slug',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
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

      const response = await sut.execute({
        slug: newQuestion.slug.value,
      })

      expect(response).toBeInstanceOf(Right)
      expect(response.isRight()).toBeTruthy()

      if (response.isRight()) {
        const { question } = response.value
        expect(question.title).toEqual(newQuestion.title)
        expect(question.slug.value).toEqual(newQuestion.slug.value)
        expect(question.authorId.toValue()).toEqual(
          newQuestion.authorId.toValue(),
        )
        expect(question.content).toEqual(newQuestion.content)
        expect(question.id.toValue()).toEqual(newQuestion.id.toValue())
      }
      expect(spyFindBySlug).toBeCalled()
    })

    it('should throw if receives a not valid question slug', async () => {
      const response = await sut.execute({
        slug: 'a-not-valid-test-slug',
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })
  })
})
