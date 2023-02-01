import { expect, test } from 'vitest'
import { stringify } from './stringify'

test('default', () => {
  expect(
    stringify({
      foo: 'bar',
      baz: {
        value: 69n,
      },
    }),
  ).toEqual('{"foo":"bar","baz":{"value":"69"}}')
})
