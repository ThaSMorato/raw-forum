import { fakeQuestionsRepository } from '$/fakeRepositories/fake-questions-repository'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'
import { expect, it } from 'vitest'

it('should create a question', async () => {
  const createQuestion = new CreateQuestionUseCase(fakeQuestionsRepository)

  const { question } = await createQuestion.execute({
    authorId: '1',
    title: 'Nova pergunta',
    content: 'Conteúdo da nova pergunta',
  })

  expect(question.title).toEqual('Nova pergunta')
  expect(question.slug.value).toEqual('nova-pergunta')
  expect(question.authorId.toValue()).toEqual('1')
  expect(question.content).toEqual('Conteúdo da nova pergunta')
  expect(question.id.toValue()).toEqual(expect.any(String))
  expect(fakeQuestionsRepository.create).toBeCalled()
})
