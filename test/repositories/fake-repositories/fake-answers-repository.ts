import { vi } from 'vitest'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'

const create = vi.fn()
const _delete = vi.fn()
const findById = vi.fn()

export const fakeAnswersRepository: AnswersRepository = {
  create,
  delete: _delete,
  findById,
}

export const functions = {
  create,
  delete: _delete,
  findById,
}
