import { expect, test } from 'vitest'

import { walletProvider } from '../../../test/utils'
import {
  InjectedProvider,
  injectedProvider,
} from '../../providers/wallet/injectedProvider'

import { requestAccountAddresses } from './requestAccountAddresses'

test('fetches block number', async () => {
  expect(await requestAccountAddresses(walletProvider! as InjectedProvider))
    .toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
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
