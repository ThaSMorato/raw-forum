import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'

export class InMemoryAnswerAttachmentsRepository
  implements AnswerAttachmentsRepository
{
  public items: AnswerAttachment[] = []

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const answerattachments = this.items.filter(
      (item) => String(item.answerId) === answerId,
    )

    return answerattachments
  }

  async deleteManyByAnswerId(answerId: string): Promise<void> {
    const answerattachments = this.items.filter(
      (item) => String(item.answerId) !== answerId,
    )

    this.items = answerattachments
  }
}
