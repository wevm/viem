import { expect, test } from 'vitest'

import { parseMessage } from './parseMessage.js'

test('default', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseMessage(message)
  expect(parsed).toMatchInlineSnapshot(`
    {
      "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
      "chainId": 1,
      "domain": "example.com",
      "expirationTime": undefined,
      "issuedAt": "2023-02-01T00:00:00.000Z",
      "nonce": "foobarbaz",
      "notBefore": undefined,
      "requestId": undefined,
      "resources": undefined,
      "scheme": undefined,
      "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
      "uri": "https://example.com/path",
      "version": "1",
    }
  `)
})

test('behavior: with scheme', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseMessage(message)
  expect(parsed.scheme).toMatchInlineSnapshot(`"https"`)
})

test('behavior: with statement', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseMessage(message)
  expect(parsed.statement).toMatchInlineSnapshot(
    `"I accept the ExampleOrg Terms of Service: https://example.com/tos"`,
  )
})

test('behavior: with expirationTime', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Expiration Time: 2022-02-04T00:00:00.000Z`
  const parsed = parseMessage(message)
  expect(parsed.expirationTime).toMatchInlineSnapshot(
    `"2022-02-04T00:00:00.000Z"`,
  )
})

test('behavior: with notBefore', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Not Before: 2022-02-04T00:00:00.000Z`
  const parsed = parseMessage(message)
  expect(parsed.notBefore).toMatchInlineSnapshot(`"2022-02-04T00:00:00.000Z"`)
})

test('behavior: with requestId', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: 123e4567-e89b-12d3-a456-426614174000`
  const parsed = parseMessage(message)
  expect(parsed.requestId).toMatchInlineSnapshot(
    `"123e4567-e89b-12d3-a456-426614174000"`,
  )
})

test('behavior: with resources', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Resources:
- https://example.com/foo
- https://example.com/bar
- https://example.com/baz`
  const parsed = parseMessage(message)
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/foo",
      "https://example.com/bar",
      "https://example.com/baz",
    ]
  `)
})
