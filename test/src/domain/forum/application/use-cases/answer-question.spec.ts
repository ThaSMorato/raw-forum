import { fakeAnswersRepository } from '$/fakeRepositories/fake-answer-repository'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'
import { expect, it } from 'vitest'

it('should create an answer', async () => {
  const answerQuestion = new AnswerQuestionUseCase(fakeAnswersRepository)

  const answer = await answerQuestion.execute({
    content: 'Nova Resposta',
    instructorId: '1',
    questionId: '1',
  })

  expect(answer.content).toEqual('Nova Resposta')
  expect(answer.authorId.toValue()).toEqual('1')
  expect(answer.questionId.toValue()).toEqual('1')
  expect(fakeAnswersRepository.create).toBeCalled()
})
