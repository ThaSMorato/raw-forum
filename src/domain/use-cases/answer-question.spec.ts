import {expect, it} from 'vitest'
import { AnswerQuestionUseCase } from './answer-question'

it('should create an answer', () => {
  const answerQuestion = new AnswerQuestionUseCase()

  const answer = answerQuestion.execute({content:'Nova Resposta', instructorId: '1', questionId: '1'})

  expect(answer.content).toEqual('Nova Resposta')
  expect(answer.authorId).toEqual('1')
  expect(answer.questionId).toEqual('1')
})
