import { Question } from '../../enterprise/entities/question'

export interface QuestionsRepository {
  create(question: Question): Promise<void>
  findBySlug(slug: string): Promise<Question | null>
  delete(question: Question): Promise<void>
  findById(id: string): Promise<Question | null>
  save(question: Question): Promise<void>
}
