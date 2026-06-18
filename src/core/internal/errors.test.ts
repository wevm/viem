import { expect, test } from 'vitest'

import { getAbortError, getUrl, isAbortError } from './errors.js'

test('passes a credential-free URL through unchanged', () => {
  expect(getUrl('https://example.com/rpc')).toMatchInlineSnapshot(
    `"https://example.com/rpc"`,
  )
})

test('strips username + password', () => {
  expect(getUrl('https://user:pass@example.com/rpc')).toMatchInlineSnapshot(
    `"https://example.com/rpc"`,
  )
})

test('strips a username-only credential', () => {
  expect(getUrl('https://user@example.com/rpc')).toMatchInlineSnapshot(
    `"https://example.com/rpc"`,
  )
})

test('strips a password-only credential', () => {
  expect(getUrl('https://:pass@example.com/rpc')).toMatchInlineSnapshot(
    `"https://example.com/rpc"`,
  )
})

test('preserves query string and hash after stripping', () => {
  expect(
    getUrl('https://user:pass@example.com/rpc?key=value#frag'),
  ).toMatchInlineSnapshot(`"https://example.com/rpc?key=value#frag"`)
})

test('returns the input untouched when not a parseable URL', () => {
  expect(getUrl('not-a-url')).toMatchInlineSnapshot(`"not-a-url"`)
})

test('getAbortError returns the signal reason when present', () => {
  const controller = new AbortController()
  controller.abort(new Error('custom reason'))
  expect((getAbortError(controller.signal) as Error).message).toBe(
    'custom reason',
  )
})

test('getAbortError falls back to an AbortError without a reason', () => {
  expect(isAbortError(getAbortError())).toBe(true)
})

test('isAbortError is false for non-abort values', () => {
  expect(isAbortError(new Error('nope'))).toBe(false)
  expect(isAbortError(null)).toBe(false)
})
