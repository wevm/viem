import { expect, test } from 'vitest'
import { withResolvers } from './withResolvers.js'

test('default', () => {
  {
    const { promise, resolve } = withResolvers<number>()
    resolve(1)
    expect(promise).resolves.toBe(1)
  }

  {
    const { promise, reject } = withResolvers<number>()
    reject(new Error('test'))
    expect(promise).rejects.toThrow('test')
  }
})
