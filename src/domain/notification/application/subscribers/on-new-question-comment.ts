import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { NewQuestionCommentEvent } from '@/domain/forum/enterprise/events/new-question-comment-event'
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'

export class OnNewQuestionComment implements EventHandler {
  constructor(
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewCommentOnQuestionNotification.bind(this),
      NewQuestionCommentEvent.name,
    )
  }

  private async sendNewCommentOnQuestionNotification({
    questionId,
    questionComment,
  }: NewQuestionCommentEvent) {
    const question = await this.questionsRepository.findById(String(questionId))

    if (question) {
      await this.sendNotification.execute({
        recipientId: String(question.authorId),
        title: `Novo comentário na sua pergunta ${question.title
          .substring(0, 10)
          .concat('...')}`,
        content: questionComment.content.substring(0, 50).concat('...'),
      })
    }
  }
}
