import { expect, test, vi } from 'vitest'

import { accounts } from '../../../../test/src/utils'

import { local } from '../../chains'
import { rpc } from '../../utils'

import { injectedProvider } from './injected'

vi.stubGlobal('window', {
  ethereum: {
    on: vi.fn((message, listener) => {
      if (message === 'accountsChanged') {
        listener([accounts[0].address])
      }
    }),
    removeListener: vi.fn(() => null),
    request: vi.fn(async ({ method, params }: any) => {
      if (method === 'eth_requestAccounts') {
        return [accounts[0].address]
      }

      const { result } = await rpc.http(local.rpcUrls.default.http, {
        body: {
          method,
          params,
        },
      })
      return result
    }),
  },
})

test('creates', async () => {
  const { uid, ...provider } = injectedProvider()!
  expect(uid).toBeDefined()
  expect(provider).toMatchInlineSnapshot(`
    {
      "key": "injected",
      "name": "Injected",
      "on": [Function],
      "pollingInterval": 4000,
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
    }
  `)
})
