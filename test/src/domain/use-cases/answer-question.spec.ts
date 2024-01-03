import {expect, it, vi} from 'vitest'
import { AnswerQuestionUseCase } from '../../../../src/domain/use-cases/answer-question'
import { fakeAnswerRepository } from '../../../fakeRepositories/fake-answer-repository'

it('should create an answer', async () => {
  const answerQuestion = new AnswerQuestionUseCase(fakeAnswerRepository)

  const answer = await answerQuestion.execute({content:'Nova Resposta', instructorId: '1', questionId: '1'})

  expect(answer.content).toEqual('Nova Resposta')
  expect(answer.authorId).toEqual('1')
  expect(answer.questionId).toEqual('1')
  expect(fakeAnswerRepository.create).toBeCalled()
})