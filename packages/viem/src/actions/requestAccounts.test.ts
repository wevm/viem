import { expect, test } from 'vitest'

import { local } from '../chains'
import { createWalletProvider } from '../providers/wallet/createWalletProvider'

import { requestAccounts } from './requestAccounts'

// TODO: create test wallet provider
const provider = createWalletProvider({
  chains: [local],
  connect: <any>(async () => null),
  on: <any>(async () => null),
  removeListener: <any>(async () => null),
  request: <any>(async ({ method }) => {
    if (method === 'eth_requestAccounts') {
      return ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac']
    }
  }),
})

test('fetches block number', async () => {
  expect(await requestAccounts(provider)).toMatchInlineSnapshot(`
    [
      "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
    ]
  `)
})
