import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import { vi } from 'vitest'

export const fakeQuestionsRepository: QuestionsRepository = {
  create: vi.fn(),
  findBySlug: vi.fn(),
}
