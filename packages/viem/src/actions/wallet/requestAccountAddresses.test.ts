import { expect, test } from 'vitest'

import { walletProvider } from '../../../test/utils'
import { injectedProvider } from '../../providers/wallet/injectedProvider'

import { requestAccountAddresses } from './requestAccountAddresses'

test('fetches block number', async () => {
  expect(await requestAccountAddresses(walletProvider!)).toMatchInlineSnapshot(`
    [
      "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    ]
  `)
})

test('errors if provider is not a wallet provider', async () => {
  try {
    // @ts-expect-error – JS consumers
    await requestAccountAddresses(injectedProvider)
  } catch (err) {
    expect(err).toMatchInlineSnapshot(`
      [InvalidProviderError: Invalid provider of type "undefined" provided
      Expected: "walletProvider"

      Details: Invalid provider given.
      Version: viem@1.0.2]
    `)
  }
})
