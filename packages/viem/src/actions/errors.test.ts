import { expect, test } from 'vitest'

import { InvalidProviderError } from './errors'

test('InvalidProviderError', () => {
  expect(
    new InvalidProviderError({
      expectedProvider: 'accountProvider',
      givenProvider: 'walletProvider',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidProviderError: Invalid provider of type "walletProvider" provided
    Expected: "accountProvider"

    Details: Invalid provider given.
    Version: viem@1.0.2]
  `)
})
