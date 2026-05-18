import { expect, test, vi } from 'vitest'

// `test/setup.ts` globally mocks `./utils`; opt out so we exercise the
// real implementation here.
vi.unmock('./utils.js')

const { getUrl } =
  await vi.importActual<typeof import('./utils.js')>('./utils.js')

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
