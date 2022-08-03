/* eslint-disable import/namespace */
import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { alchemyProvider } from './alchemyProvider'

test('creates', async () => {
  const provider = alchemyProvider({
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
          "alchemy": "https://eth-mainnet.alchemyapi.io/v2",
          "infura": "https://mainnet.infura.io/v3",
          "public": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
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
            "alchemy": "https://eth-mainnet.alchemyapi.io/v2",
            "infura": "https://mainnet.infura.io/v3",
            "public": "https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC",
          },
        },
      ],
      "id": "alchemy",
      "name": "Alchemy",
      "request": [Function],
      "type": "networkProvider",
    }
  `)
})

Object.keys(chains).forEach((key) => {
  // @ts-expect-error – testing
  const chain = chains[key]
  if (!chain.rpcUrls.alchemy) return

  test(`request (${key})`, async () => {
    const provider = alchemyProvider({
      chain,
    })

    expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
  })
})
/* eslint-enable import/namespace */
