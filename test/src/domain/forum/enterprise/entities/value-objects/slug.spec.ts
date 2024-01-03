import { expect, it } from 'vitest'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'

it('should be able to create a new slug from text', () => {
  const slug = Slug.createFromText('Example question title')

  expect(slug.value).toEqual('example-question-title')
})
