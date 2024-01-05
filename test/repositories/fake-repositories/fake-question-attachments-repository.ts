import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { vi } from 'vitest'

const findManyByQuestionId = vi.fn()
const deleteManyByQuestionId = vi.fn()

export const functions = {
  findManyByQuestionId,
  deleteManyByQuestionId,
}

export const fakeQuestionAttachmentsRepository: QuestionAttachmentsRepository =
  functions
