import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface QuestionAttachmentProps {
  questionId: string
  attachmentId: string
}

export class QuestionAttachment extends Entity<QuestionAttachmentProps> {
  get questionId(): string {
    return this.props.questionId
  }

  get attachmentId(): string {
    return this.props.attachmentId
  }

  static create(
    props: QuestionAttachmentProps,
    id?: UniqueEntityID,
  ): QuestionAttachment {
    const attachment = new QuestionAttachment(props, id)

    return attachment
  }
}
