import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import { vi } from 'vitest'

const create = vi.fn()
const findBySlug = vi.fn()
const _delete = vi.fn()
const findById = vi.fn()

export const fakeQuestionsRepository: QuestionsRepository = {
  create,
  findBySlug,
  delete: _delete,
  findById,
}

export const functions = {
  create,
  findBySlug,
  delete: _delete,
  findById,
}
