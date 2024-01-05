import { InMemoryQuestionAttachmentsRepository } from '$/repositories/in-memory/in-memory-question-attachments-repository'
import { InMemoryQuestionsRepository } from '$/repositories/in-memory/in-memory-questions-repository'

export function makeInMemoryQuestionRepository(
  inMemoryAttachmentsRepository: InMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository(),
) {
  return new InMemoryQuestionsRepository(inMemoryAttachmentsRepository)
}
