import { expect, test } from 'vitest'

import { isUri } from './utils.js'

test('isUri - default', () => {
  expect(isUri('https://example.com/foo')).toMatchInlineSnapshot(
    `"https://example.com/foo"`,
  )
})

test('isUri - behavior: check for illegal characters', () => {
  expect(isUri('^')).toBeFalsy()
})

test('isUri - incomplete hex escapes', () => {
  expect(isUri('%$#')).toBeFalsy()
  expect(isUri('%0:#')).toBeFalsy()
})

test('isUri - missing scheme', () => {
  expect(isUri('example.com/foo')).toBeFalsy()
})

test('isUri - authority with missing path', () => {
  expect(isUri('1http:////foo.html')).toBeFalsy()
})

test('isUri - scheme begins with letter', () => {
  expect(isUri('$https://example.com/foo')).toBeFalsy()
})

test('isUri - query', () => {
  expect(isUri('https://example.com/foo?bar')).toMatchInlineSnapshot(
    `"https://example.com/foo?bar"`,
  )
})

test('isUri - fragment', () => {
  expect(isUri('https://example.com/foo#bar')).toMatchInlineSnapshot(
    `"https://example.com/foo#bar"`,
  )
})
