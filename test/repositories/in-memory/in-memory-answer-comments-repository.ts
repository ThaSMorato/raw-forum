import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'

export class InMemoryAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  public items: AnswerComment[] = []

  async create(answerComment: AnswerComment): Promise<void> {
    this.items.push(answerComment)
  }

  async findById(id: string): Promise<AnswerComment | null> {
    const answerComment = this.items.find((item) => String(item.id) === id)

    if (!answerComment) {
      return null
    }

    return answerComment
  }

  async delete(answerComment: AnswerComment): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id === answerComment.id,
    )

    this.items.splice(itemIndex, 1)
  }
}
