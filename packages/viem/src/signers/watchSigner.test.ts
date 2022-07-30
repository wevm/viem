import { expect, test } from 'vitest'

import { local } from '../chains'
import { createWalletProvider } from '../providers/wallet/createWalletProvider'

import { watchSigner } from './watchSigner'

// TODO: create test wallet provider
const provider = createWalletProvider({
  chains: [local],
  connect: <any>(async () => null),
  on: <any>(async (message, listener) => {
    if (message === 'accountsChanged') {
      listener(['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'])
    }
  }),
  removeListener: <any>(async () => null),
  request: <any>(async () => null),
})

test('watches signer', async () => {
  watchSigner(provider!, ({ signer }) => {
    expect(signer).toMatchInlineSnapshot(`
      {
        "address": "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
        "request": [Function],
      }
    `)
  })
})
