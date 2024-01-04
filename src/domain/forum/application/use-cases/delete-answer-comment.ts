import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

interface DeleteAnswerCommentUseCaseRequest {
  answerCommentId: string
  authorId: string
}

interface DeleteAnswerCommentUseCaseResponse {}

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    answerCommentId,
    authorId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment =
      await this.answerCommentsRepository.findById(answerCommentId)

    if (!answerComment) {
      throw new Error('Answer Comment not found')
    }

    if (authorId !== String(answerComment.authorId)) {
      throw new Error('Not allowed')
    }

    await this.answerCommentsRepository.delete(answerComment)

    return {}
  }
}
