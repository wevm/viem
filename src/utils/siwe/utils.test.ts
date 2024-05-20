import { expect, test } from 'vitest'

import { isISO8601, isUri } from './utils.js'

test('isISO8601', () => {
  expect(isISO8601(new Date().toISOString())).toMatchInlineSnapshot('true')
  expect(isISO8601(new Date().toString())).toMatchInlineSnapshot('false')
})

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
