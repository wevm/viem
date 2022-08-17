import { expect, test } from 'vitest'

import { mainnet, polygon } from '../../chains'

import { externalProvider } from './externalProvider'

test('creates', () => {
  const fooProvider = {
    on: () => null,
    removeListener: () => null,
    request: <any>(() => null),
  }
  const provider = externalProvider(fooProvider, { chains: [mainnet, polygon] })
  expect(provider).toMatchInlineSnapshot(`
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
            "alchemy": {
              "http": "https://eth-mainnet.alchemyapi.io/v2",
            },
            "default": {
              "http": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
            },
            "infura": {
              "http": "https://mainnet.infura.io/v3",
            },
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
            "alchemy": {
              "http": "https://polygon-mainnet.g.alchemy.com/v2",
            },
            "default": {
              "http": "https://polygon-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
            },
            "infura": {
              "http": "https://polygon-mainnet.infura.io/v3",
            },
          },
        },
      ],
      "id": "external",
      "name": "External",
      "on": [Function],
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
    }
  `)
})
