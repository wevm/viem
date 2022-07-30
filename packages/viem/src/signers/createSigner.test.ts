import { expect, test } from 'vitest'

import { local } from '../chains'
import { createWalletProvider } from '../providers/wallet/createWalletProvider'

import { createSigner } from './createSigner'

// TODO: create test wallet provider
const provider = createWalletProvider({
  chains: [local],
  connect: <any>(async () => null),
  on: <any>(async () => null),
  removeListener: <any>(async () => null),
  request: <any>(async () => null),
})

test('creates signer', async () => {
  expect(
    createSigner(provider!, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    }),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
      "request": [Function],
    }
  `)
})
