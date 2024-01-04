import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { vi } from 'vitest'

const create = vi.fn()

export const functions = {
  create,
}

export const fakeAnswerCommentsRepository: AnswerCommentsRepository = functions
