import { InMemoryAnswerAttachmentsRepository } from '$/repositories/in-memory/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from '$/repositories/in-memory/in-memory-answers-repository'

export function makeInMemoryAnswerRepository(
  inMemoryAttachmentsRepository: InMemoryAnswerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository(),
) {
  return new InMemoryAnswersRepository(inMemoryAttachmentsRepository)
}
