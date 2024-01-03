import { vi } from 'vitest'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'

export const fakeAnswersRepository: AnswersRepository = {
  create: vi.fn(),
}
