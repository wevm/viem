import { expect, test } from 'vitest'

import { mainnet, polygon } from '../../chains'
import { alchemyProvider } from './alchemyProvider'

test('creates', async () => {
  const provider = alchemyProvider({
    chains: [mainnet, polygon],
  })

  expect(provider(mainnet)).toMatchInlineSnapshot(`
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
            "infura": "https://mainnet.infura.io/v3",
            "public": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
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
            "infura": "https://polygon-mainnet.infura.io/v3",
            "public": "https://polygon-mainnet.g.alchemy.com/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          },
        },
      ],
      "request": [Function],
    }
  `)
})

test('request', async () => {
  const provider = alchemyProvider({
    chains: [mainnet, polygon],
  })

  expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
})
