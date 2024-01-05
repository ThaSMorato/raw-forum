import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { vi } from 'vitest'

const findManyByQuestionId = vi.fn()

export const functions = {
  findManyByQuestionId,
}

export const fakeQuestionAttachmentsRepository: QuestionAttachmentsRepository =
  functions
