import { makeQuestion } from '$/factories/make-question'
import {
  fakeQuestionsRepository,
  functions,
} from '$/repositories/fake-repositories/fake-questions-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'

let sut: FetchRecentQuestionsUseCase
let inMemoryRepository: InMemoryQuestionsRepository

describe('Fetch Recent Questions Use Case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unity tests', () => {
    beforeEach(() => {
      sut = new FetchRecentQuestionsUseCase(fakeQuestionsRepository)
    })
    it('should be able to fetch recent questions', async () => {
      const respose = [makeQuestion()]
      functions.findManyRecent.mockResolvedValue(respose)

      const { questions } = await sut.execute({
        page: 1,
      })

      expect(questions).toHaveLength(1)
      expect(questions).toBe(respose)

      expect(functions.findManyRecent).toBeCalled()
      expect(functions.findManyRecent).toBeCalledWith({
        page: 1,
      })
    })
  })

  describe('Integration tests', () => {
    beforeEach(() => {
      inMemoryRepository = new InMemoryQuestionsRepository()
      sut = new FetchRecentQuestionsUseCase(inMemoryRepository)
    })

    it('should be able to fetch recent questions', async () => {
      await inMemoryRepository.create(
        makeQuestion({ createdAt: new Date(2023, 0, 20) }),
      )
      await inMemoryRepository.create(
        makeQuestion({ createdAt: new Date(2023, 0, 18) }),
      )
      await inMemoryRepository.create(
        makeQuestion({ createdAt: new Date(2023, 0, 23) }),
      )

      const spyFindManyRecent = vi.spyOn(inMemoryRepository, 'findManyRecent')

      const { questions } = await sut.execute({
        page: 1,
      })

      expect(questions).toEqual([
        expect.objectContaining({ createdAt: new Date(2023, 0, 23) }),
        expect.objectContaining({ createdAt: new Date(2023, 0, 20) }),
        expect.objectContaining({ createdAt: new Date(2023, 0, 18) }),
      ])

      expect(spyFindManyRecent).toBeCalled()
    })

    it('should be able to fetch paginated recent questions', async () => {
      for (let index = 1; index <= 22; index++) {
        await inMemoryRepository.create(
          makeQuestion({ createdAt: new Date(2023, 0, 23 - index) }),
        )
      }
      const spyFindManyRecent = vi.spyOn(inMemoryRepository, 'findManyRecent')

      const { questions } = await sut.execute({
        page: 2,
      })

      expect(questions).toEqual([
        expect.objectContaining({ createdAt: new Date(2023, 0, 2) }),
        expect.objectContaining({ createdAt: new Date(2023, 0, 1) }),
      ])
      expect(questions).toHaveLength(2)

      expect(spyFindManyRecent).toBeCalled()
    })
  })
})
