import { vi } from 'vitest'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'

const create = vi.fn()

export const fakeAnswersRepository: AnswersRepository = {
  create,
}

export const functions = {
  create,
}
