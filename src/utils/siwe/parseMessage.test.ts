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

test.todo('behavior: with expirationTime')
test.todo('behavior: with issuedAt')
test.todo('behavior: with notBefore')
test.todo('behavior: with requestId')
test.todo('behavior: with resources')
