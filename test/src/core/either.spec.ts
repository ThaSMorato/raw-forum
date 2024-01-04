import { Either, Left, Right, left, right } from '@/core/either'

function doSomething(shouldSuccess: boolean): Either<string, string> {
  if (shouldSuccess) {
    return right('success')
  }

  return left('error')
}

describe('Either error handler', () => {
  it('should return a success as right', () => {
    const result = doSomething(true)

    expect(result.value).toBe('success')
    expect(result).toBeInstanceOf(Right)
    expect(result.isRight()).toBeTruthy()
    expect(result.isLeft()).toBeFalsy()
  })

  it('should return an error as left', () => {
    const result = doSomething(false)

    expect(result.value).toBe('error')
    expect(result).toBeInstanceOf(Left)
    expect(result.isRight()).toBeFalsy()
    expect(result.isLeft()).toBeTruthy()
  })
})
