import { describe, expect, test } from 'vitest'

import * as chains from '../../chains'
import { alchemyHttpProvider, alchemyWebSocketProvider } from './alchemy'

describe('http provider', () => {
  test('creates', async () => {
    const provider = alchemyHttpProvider({
      chain: chains.mainnet,
    })

    expect(provider).toMatchInlineSnapshot(`
      {
        "chain": {
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
            "alchemy": {
              "http": "https://eth-mainnet.alchemyapi.io/v2",
              "webSocket": "wss://eth-mainnet.g.alchemy.com/v2",
            },
            "default": {
              "http": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
              "webSocket": "wss://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
            },
            "infura": {
              "http": "https://mainnet.infura.io/v3",
              "webSocket": "wss://mainnet.infura.io/ws/v3",
            },
          },
        },
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
              "alchemy": {
                "http": "https://eth-mainnet.alchemyapi.io/v2",
                "webSocket": "wss://eth-mainnet.g.alchemy.com/v2",
              },
              "default": {
                "http": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
                "webSocket": "wss://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
              },
              "infura": {
                "http": "https://mainnet.infura.io/v3",
                "webSocket": "wss://mainnet.infura.io/ws/v3",
              },
            },
          },
        ],
        "id": "alchemy-http",
        "name": "Alchemy",
        "request": [Function],
        "transportMode": "http",
        "type": "networkProvider",
      }
    `)
  })

  Object.keys(chains).forEach((key) => {
    /* eslint-disable-next-line import/namespace */
    const chain = (<any>chains)[key]
    if (!chain.rpcUrls.alchemy) return

    test(`request (${key})`, async () => {
      const provider = alchemyHttpProvider({
        chain,
      })

      expect(
        await provider.request({ method: 'eth_blockNumber' }),
      ).toBeDefined()
    })
  })
})

describe('web socket provider', () => {
  test('creates', async () => {
    const provider = alchemyWebSocketProvider({
      chain: chains.mainnet,
    })

    expect(provider).toMatchInlineSnapshot(`
      {
        "chain": {
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
            "alchemy": {
              "http": "https://eth-mainnet.alchemyapi.io/v2",
              "webSocket": "wss://eth-mainnet.g.alchemy.com/v2",
            },
            "default": {
              "http": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
              "webSocket": "wss://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
            },
            "infura": {
              "http": "https://mainnet.infura.io/v3",
              "webSocket": "wss://mainnet.infura.io/ws/v3",
            },
          },
        },
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
              "alchemy": {
                "http": "https://eth-mainnet.alchemyapi.io/v2",
                "webSocket": "wss://eth-mainnet.g.alchemy.com/v2",
              },
              "default": {
                "http": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
                "webSocket": "wss://eth-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
              },
              "infura": {
                "http": "https://mainnet.infura.io/v3",
                "webSocket": "wss://mainnet.infura.io/ws/v3",
              },
            },
          },
        ],
        "getSocket": [Function],
        "id": "alchemy-webSocket",
        "name": "Alchemy",
        "request": [Function],
        "transportMode": "webSocket",
        "type": "networkProvider",
      }
    `)
  })

  Object.keys(chains).forEach((key) => {
    /* eslint-disable-next-line import/namespace */
    const chain = (<any>chains)[key]
    if (!chain.rpcUrls.alchemy) return

    test(`request (${key})`, async () => {
      const provider = alchemyWebSocketProvider({
        chain,
      })

      expect(
        await provider.request({ method: 'eth_blockNumber' }),
      ).toBeDefined()
    })
  })
})
