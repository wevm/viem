import { expect, test } from 'vitest'
import { extract } from './extract.js'

test('default', () => {
  expect(
    extract({ foo: 1, bar: 'wagmi' }, { formatter: () => ({ foo: null }) }),
  ).toEqual({ foo: 1 })
  expect(
    extract({ foo: 1, bar: 'wagmi' }, { formatter: () => ({ baz: null }) }),
  ).toEqual({})
  expect(extract({ foo: 1, bar: 'wagmi' }, { formatter: undefined })).toEqual(
    {},
  )
})
