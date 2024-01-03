import { vi } from 'vitest'
import { AnswerRepository } from '../../src/domain/repositories/answers-repository'

export const fakeAnswerRepository: AnswerRepository = {
  create: vi.fn(),
}
