import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { vi } from 'vitest'

const create = vi.fn()
const _delete = vi.fn()
const findById = vi.fn()
const findManyByQuestionId = vi.fn()

export const functions = {
  create,
  delete: _delete,
  findById,
  findManyByQuestionId,
}

export const fakeQuestionCommentsRepository: QuestionCommentsRepository =
  functions
