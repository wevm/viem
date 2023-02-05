import { describe, expect, test } from 'vitest'
import { celo } from '../chains'
import { defineChain } from './chain'

describe('defineChain', () => {
  test('default', () => {
    expect(
      defineChain({
        id: 42220,
        name: 'Celo',
        network: 'celo',
        nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
        rpcUrls: {
          public: { http: ['https://rpc.ankr.com/celo'] },
          default: { http: ['https://rpc.ankr.com/celo'] },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "id": 42220,
        "name": "Celo",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Celo",
          "symbol": "CELO",
        },
        "network": "celo",
        "rpcUrls": {
          "default": {
            "http": [
              "https://rpc.ankr.com/celo",
            ],
          },
          "public": {
            "http": [
              "https://rpc.ankr.com/celo",
            ],
          },
        },
      }
    `)
  })
})
