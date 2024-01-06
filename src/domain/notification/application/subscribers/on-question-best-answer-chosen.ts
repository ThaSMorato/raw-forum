import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { QuestionBestAnswerEvent } from '@/domain/forum/enterprise/events/question-best-answer-event'

export class OnQuestionBestAnswerChosen implements EventHandler {
  constructor(
    private answersRepository: AnswersRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestAnswerEvent.name,
    )
  }

  private async sendQuestionBestAnswerNotification({
    question,
    bestAnswerId,
  }: QuestionBestAnswerEvent) {
    const answer = await this.answersRepository.findById(String(bestAnswerId))

    if (answer) {
      await this.sendNotification.execute({
        recipientId: String(answer.authorId),
        title: 'Sua responsta foi escolhida',
        content: `A resposta que você enviou em ${question.title
          .substring(0, 20)
          .concat('...')} foi escolhida pelo autor`,
      })
    }
  }
}
