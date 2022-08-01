import { expect, test } from 'vitest'

import { walletProvider } from '../../../test/utils'
import { injectedProvider } from '../../providers/wallet/injectedProvider'

import { requestAccountAddresses } from './requestAccountAddresses'

test('fetches block number', async () => {
  expect(await requestAccountAddresses(walletProvider!)).toMatchInlineSnapshot(`
    [
      "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
    ]
  `)
})

test('errors if provider is not a wallet provider', async () => {
  try {
    // @ts-expect-error – JS consumers
    await requestAccountAddresses(injectedProvider)
  } catch (err) {
    expect(err).toMatchInlineSnapshot('[Error: TODO]')
  }
})
