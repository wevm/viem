import { expect, test, vi } from 'vitest'

import { local } from '../chains'
import { injectedProvider } from '../providers/wallet/injectedProvider'

import { requestAccounts } from './requestAccounts'

vi.stubGlobal('window', {
  ethereum: {
    on: () => null,
    removeListener: () => null,
    request: vi.fn(({ method }) => {
      if (method === 'eth_requestAccounts') {
        return ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac']
      }
    }),
  },
})

test('fetches block number', async () => {
  const provider = injectedProvider({ chains: [local] })
  expect(await requestAccounts(provider!)).toMatchInlineSnapshot(`
    [
      "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
    ]
  `)
})
