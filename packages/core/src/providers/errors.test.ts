import { expect, test } from 'vitest'

import { ProviderRpcError } from './errors'

test('ProviderRpcError', () => {
  expect(
    new ProviderRpcError(
      { code: 1337, message: 'error details' },
      { humanMessage: 'An internal error was received.' },
    ),
  ).toMatchInlineSnapshot(`
    [ProviderRpcError: An internal error was received.

    Details: error details
    Version: viem@1.0.2]
  `)
})

test('ProviderRpcError', () => {
  expect(
    new ProviderRpcError(
      { code: 1337, message: 'error details' },
      {
        humanMessage: 'An internal error was received.',
        docsLink: 'https://viem.sh',
      },
    ),
  ).toMatchInlineSnapshot(`
    [ProviderRpcError: An internal error was received.

    Docs: https://viem.sh

    Details: error details
    Version: viem@1.0.2]
  `)
})
