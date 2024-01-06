import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { Comment, CommentProps } from './comment'
import { NewQuestionCommentEvent } from '../events/new-question-comment-event'

export interface QuestionCommentProps extends CommentProps {
  questionId: UniqueEntityID
}

export class QuestionComment extends Comment<QuestionCommentProps> {
  static create(
    props: Optional<QuestionCommentProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const questionComment = new QuestionComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    const isNewComment = !id

    if (isNewComment) {
      questionComment.addDomainEvent(
        new NewQuestionCommentEvent(
          questionComment,
          questionComment.questionId,
        ),
      )
    }

    return questionComment
  }

  get questionId() {
    return this.props.questionId
  }
}
