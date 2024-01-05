import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'

export class InMemoryQuestionAttachmentsRepository
  implements QuestionAttachmentsRepository
{
  public items: QuestionAttachment[] = []

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionattachments = this.items.filter(
      (item) => String(item.questionId) === questionId,
    )

    return questionattachments
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    const questionattachments = this.items.filter(
      (item) => String(item.questionId) !== questionId,
    )

    this.items = questionattachments
  }
}
