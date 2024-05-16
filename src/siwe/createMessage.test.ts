import { expect, test, vi } from 'vitest'

import { mainnet } from '../chains/index.js'
import { createMessage } from './createMessage.js'
import type { Message } from './types.js'

// TODO: Validation tests

const message = {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  chainId: mainnet.id,
  domain: 'example.com',
  nonce: 'foobarbaz',
  uri: 'https://example.com/path',
  version: '1',
} satisfies Message

test('default', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(createMessage(message)).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `)

  vi.useRealTimers()
})

test('parameters: statement', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      statement:
        'I accept the ExampleOrg Terms of Service: https://example.com/tos',
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    I accept the ExampleOrg Terms of Service: https://example.com/tos

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `)

  vi.useRealTimers()
})
