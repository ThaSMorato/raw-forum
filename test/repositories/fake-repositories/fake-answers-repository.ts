import { vi } from 'vitest'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'

const create = vi.fn()
const _delete = vi.fn()
const findById = vi.fn()
const save = vi.fn()
const findManyByQuestionId = vi.fn()

export const functions = {
  create,
  delete: _delete,
  findById,
  save,
  findManyByQuestionId,
}

export const fakeAnswersRepository: AnswersRepository = functions
