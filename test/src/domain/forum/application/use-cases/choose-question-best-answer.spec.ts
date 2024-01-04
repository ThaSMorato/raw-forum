import { makeAnswer } from '$/factories/make-answer'
import { makeQuestion } from '$/factories/make-question'
import {
  fakeAnswersRepository,
  functions as answerFunctions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import {
  fakeQuestionsRepository,
  functions as questionFunctions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer'

let sut: ChooseQuestionBestAnswerUseCase
let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository

const newQuestion = makeQuestion({
  authorId: new UniqueEntityID('author-1'),
})

const newAnswer = makeAnswer({
  questionId: newQuestion.id,
})

describe('Chose Question Best Answer Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new ChooseQuestionBestAnswerUseCase(
        fakeAnswersRepository,
        fakeQuestionsRepository,
      )
    })
    it('should be able to choose the question best answer', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)
      questionFunctions.findById.mockResolvedValue(newQuestion)

      await sut.execute({
        answerId: String(newAnswer.id),
        authorId: String(newQuestion.authorId),
      })

      expect(questionFunctions.findById).toBeCalled()
      expect(questionFunctions.save).toBeCalled()
      expect(answerFunctions.findById).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)

      try {
        await sut.execute({
          answerId: String(newAnswer.id),
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
      expect(questionFunctions.save).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      answerFunctions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
      }
      expect(questionFunctions.save).not.toBeCalled()
    })
    it('should throw if question repo returns null', async () => {
      answerFunctions.findById.mockResolvedValue(newAnswer)
      questionFunctions.findById.mockResolvedValue(null)

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Question not found')
      }
      expect(questionFunctions.save).not.toBeCalled()
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryAnswersRepository = new InMemoryAnswersRepository()
      inMemoryQuestionsRepository = new InMemoryQuestionsRepository()
      sut = new ChooseQuestionBestAnswerUseCase(
        inMemoryAnswersRepository,
        inMemoryQuestionsRepository,
      )
    })

    it('should be able to choose the question best answer', async () => {
      await inMemoryAnswersRepository.create(newAnswer)
      await inMemoryQuestionsRepository.create(newQuestion)

      const spyFindAnswerById = vi.spyOn(inMemoryAnswersRepository, 'findById')
      const spyFindQuestionById = vi.spyOn(
        inMemoryQuestionsRepository,
        'findById',
      )
      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')

      await sut.execute({
        answerId: String(newAnswer.id),
        authorId: String(newQuestion.authorId),
      })

      expect(spyFindAnswerById).toBeCalled()
      expect(spyFindQuestionById).toBeCalled()
      expect(spySave).toBeCalled()
      expect(inMemoryQuestionsRepository.items[0].bestAnswerId).toBe(
        newAnswer.id,
      )
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryAnswersRepository.create(newAnswer)
      await inMemoryQuestionsRepository.create(newQuestion)

      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')

      try {
        await sut.execute({
          answerId: String(newAnswer.id),
          authorId: 'author-2',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Not allowed')
      }
      expect(spySave).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')

      try {
        await sut.execute({
          answerId: 'a-not-valid-id',
          authorId: 'author-1',
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
      }
      expect(spySave).not.toBeCalled()
    })
    it('should throw if returns a invalid question', async () => {
      const spySave = vi.spyOn(inMemoryQuestionsRepository, 'save')
      const spyFindById = vi.spyOn(inMemoryQuestionsRepository, 'findById')

      spyFindById.mockResolvedValue(null)
      try {
        await sut.execute({
          answerId: String(newAnswer.id),
          authorId: String(newQuestion.authorId),
        })
      } catch (error) {
        const err = error as Error
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual('Answer not found')
      }
      expect(spySave).not.toBeCalled()
    })
  })
})
