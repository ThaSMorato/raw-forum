import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { NewAnswerCommentEvent } from '@/domain/forum/enterprise/events/new-answer-comment-event'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'

export class OnNewAnswerComment implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewCommentOnAnswerNotification.bind(this),
      NewAnswerCommentEvent.name,
    )
  }

  private async sendNewCommentOnAnswerNotification({
    answerId,
    answerComment,
  }: NewAnswerCommentEvent) {
    const answer = await this.answersRepository.findById(String(answerId))

    if (answer) {
      await this.sendNotification.execute({
        recipientId: String(answer.authorId),
        title: `Novo comentário na sua resposta ${answer.content
          .substring(0, 10)
          .concat('...')}`,
        content: answerComment.content.substring(0, 50).concat('...'),
      })
    }
  }
}
