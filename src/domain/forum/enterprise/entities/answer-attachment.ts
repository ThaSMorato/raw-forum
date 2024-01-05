import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface AnswerAttachmentProps {
  answerId: string
  attachmentId: string
}

export class AnswerAttachment extends Entity<AnswerAttachmentProps> {
  get answerId(): string {
    return this.props.answerId
  }

  get attachmentId(): string {
    return this.props.attachmentId
  }

  static create(
    props: AnswerAttachmentProps,
    id?: UniqueEntityID,
  ): AnswerAttachment {
    const attachment = new AnswerAttachment(props, id)

    return attachment
  }
}
