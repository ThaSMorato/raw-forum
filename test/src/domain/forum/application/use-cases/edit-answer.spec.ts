import { makeAnswer } from '$/factories/make-answer'
import { makeAnswerAttachment } from '$/factories/make-answer-attachment'
import { makeInMemoryAnswerRepository } from '$/factories/make-in-memory-answer-repository'
import { fakeAnswerAttachmentsRepository } from '$/repositories/fake-repositories/fake-answer-attachments-repository'
import {
  fakeAnswersRepository,
  functions,
} from '$/repositories/fake-repositories/fake-answers-repository'
import { InMemoryAnswerAttachmentsRepository } from '$/repositories/in-memory/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'
import { Left } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let sut: EditAnswerUseCase
let inMemoryAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryRepository: InMemoryAnswersRepository

const newAnswer = makeAnswer(
  {
    authorId: new UniqueEntityID('author-1'),
  },
  new UniqueEntityID('answer-1'),
)

describe('Edit Answer Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new EditAnswerUseCase(
        fakeAnswersRepository,
        fakeAnswerAttachmentsRepository,
      )
    })
    it('should be able to Edit a answer', async () => {
      functions.findById.mockResolvedValue(newAnswer)

      await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-1',
        content: 'new content',
        attachmentsIds: [],
      })

      expect(functions.findById).toBeCalled()
      expect(functions.save).toBeCalled()
    })
    it('should throw if receives a not valid author id', async () => {
      functions.findById.mockResolvedValue(newAnswer)

      const response = await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-2',
        content: 'new content',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
    })
    it('should throw if receives a not valid answer id', async () => {
      functions.findById.mockResolvedValue(null)

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
        content: 'new content',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = makeInMemoryAnswerRepository()
      inMemoryAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
      sut = new EditAnswerUseCase(
        inMemoryRepository,
        inMemoryAttachmentsRepository,
      )
    })

    it('should be able to Edit a answer', async () => {
      await inMemoryRepository.create(newAnswer)

      inMemoryAttachmentsRepository.items.push(
        makeAnswerAttachment({
          answerId: newAnswer.id,
          attachmentId: new UniqueEntityID('1'),
        }),
        makeAnswerAttachment({
          answerId: newAnswer.id,
          attachmentId: new UniqueEntityID('2'),
        }),
      )

      const spyFindById = vi.spyOn(inMemoryRepository, 'findById')
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-1',
        content: 'new content',
        attachmentsIds: ['1', '3'],
      })

      expect(spyFindById).toBeCalled()
      expect(spyEdit).toBeCalled()
      expect(inMemoryRepository.items.length).toBe(1)
      expect(inMemoryRepository.items[0]).toMatchObject({
        content: 'new content',
      })
      expect(inMemoryRepository.items[0].attachments.currentItems).toHaveLength(
        2,
      )
      expect(inMemoryRepository.items[0].attachments.currentItems).toEqual([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('3') }),
      ])
    })
    it('should throw if receives a not valid author id', async () => {
      await inMemoryRepository.create(newAnswer)

      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      const response = await sut.execute({
        answerId: 'answer-1',
        authorId: 'author-2',
        content: 'new content',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(NotAllowedError)
      expect(spyEdit).not.toBeCalled()
    })
    it('should throw if receives a not valid answer id', async () => {
      const spyEdit = vi.spyOn(inMemoryRepository, 'save')

      const response = await sut.execute({
        answerId: 'a-not-valid-id',
        authorId: 'author-1',
        content: 'new content',
        attachmentsIds: [],
      })
      expect(response).toBeInstanceOf(Left)
      expect(response.isLeft()).toBeTruthy()
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
      expect(spyEdit).not.toBeCalled()
    })
  })
})
