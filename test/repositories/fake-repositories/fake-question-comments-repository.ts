import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { vi } from 'vitest'

const create = vi.fn()

export const functions = {
  create,
}

export const fakeQuestionCommentsRepository: QuestionCommentsRepository =
  functions
