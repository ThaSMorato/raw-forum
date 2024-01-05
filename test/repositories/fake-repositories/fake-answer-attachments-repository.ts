import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { vi } from 'vitest'

const findManyByAnswerId = vi.fn()
const deleteManyByAnswerId = vi.fn()

export const functions = {
  findManyByAnswerId,
  deleteManyByAnswerId,
}

export const fakeAnswerAttachmentsRepository: AnswerAttachmentsRepository =
  functions
