import { expect, test, vi } from 'vitest'

import { accounts } from '../../../test/utils'

import { local, mainnet, polygon } from '../../chains'
import { rpc } from '../../utils'

import { injectedProvider } from './injectedProvider'

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

      const { result } = await rpc.http(local.rpcUrls.default, {
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
  expect(injectedProvider({ chains: [mainnet, polygon] }))
    .toMatchInlineSnapshot(`
      {
        "chains": [
          {
            "blockExplorers": {
              "default": {
                "name": "Etherscan",
                "url": "https://etherscan.io",
              },
              "etherscan": {
                "name": "Etherscan",
                "url": "https://etherscan.io",
              },
            },
            "ens": {
              "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
            },
            "id": 1,
            "multicall": {
              "address": "0xca11bde05977b3631167028862be2a173976ca11",
              "blockCreated": 14353601,
            },
            "name": "Ethereum",
            "nativeCurrency": {
              "decimals": 18,
              "name": "Ether",
              "symbol": "ETH",
            },
            "network": "mainnet",
            "rpcUrls": {
              "alchemy": "https://eth-mainnet.alchemyapi.io/v2",
              "default": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
              "infura": "https://mainnet.infura.io/v3",
            },
          },
          {
            "blockExplorers": {
              "default": {
                "name": "PolygonScan",
                "url": "https://polygonscan.com",
              },
              "etherscan": {
                "name": "PolygonScan",
                "url": "https://polygonscan.com",
              },
            },
            "id": 137,
            "multicall": {
              "address": "0xca11bde05977b3631167028862be2a173976ca11",
              "blockCreated": 25770160,
            },
            "name": "Polygon",
            "nativeCurrency": {
              "decimals": 18,
              "name": "MATIC",
              "symbol": "MATIC",
            },
            "network": "polygon",
            "rpcUrls": {
              "alchemy": "https://polygon-mainnet.g.alchemy.com/v2",
              "default": "https://polygon-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
              "infura": "https://polygon-mainnet.infura.io/v3",
            },
          },
        ],
        "id": "injected",
        "name": "Injected",
        "on": [Function],
        "removeListener": [Function],
        "request": [Function],
        "type": "walletProvider",
      }
    `)
})
