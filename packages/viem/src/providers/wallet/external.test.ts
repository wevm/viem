import { expect, test } from 'vitest'

import { mainnet, polygon } from '../../chains'

import { externalProvider } from './external'

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
          "blockTime": 12000,
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
            "default": {
              "http": "https://cloudflare-eth.com",
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
            "default": {
              "http": "https://polygon-rpc.com",
            },
          },
        },
      ],
      "key": "external",
      "name": "External",
      "on": [Function],
      "pollingInterval": 4000,
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
      "uniqueId": "external",
    }
  `)
})
