import { expect, test } from 'vitest'

import { isUri } from './utils.js'

test('isUri - behavior: check for illegal characters', () => {
  expect(isUri(';')).toMatchInlineSnapshot('false')
})

test('isUri - behavior: check for incomplete hex escapes', () => {
  expect(isUri('\\xF')).toMatchInlineSnapshot('false')
  expect(isUri('foo\\xF')).toMatchInlineSnapshot('false')
})

test('isUri - behavior: no split value', () => {
  expect(isUri('')).toMatchInlineSnapshot('false')
})

test('isUri - behavior: no scheme', () => {
  expect(isUri('example.com')).toMatchInlineSnapshot('false')
})

test('isUri - behavior: scheme does not begin with letter', () => {
  expect(isUri('$https://example.com')).toMatchInlineSnapshot('false')
})
