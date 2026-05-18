import { expect, test } from 'vitest'

import { extract } from './extract.js'

test('default', () => {
  expect(
    extract({ foo: 1, bar: 'wagmi' }, { format: () => ({ foo: null }) }),
  ).toEqual({ foo: 1 })
  expect(
    extract({ foo: 1, bar: 'wagmi' }, { format: () => ({ baz: null }) }),
  ).toEqual({})
  expect(extract({ foo: 1, bar: 'wagmi' }, { format: undefined })).toEqual({})
  expect(
    extract(
      { foo: 1, bar: 'wagmi', baz: 'foo' },
      {
        format: () => ({
          x: null,
          nested: { baz: null, x: { bar: null } },
        }),
      },
    ),
  ).toEqual({ bar: 'wagmi', baz: 'foo' })
})
