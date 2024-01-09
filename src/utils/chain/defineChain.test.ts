import { expect, test } from 'vitest'

import { defineChain } from './defineChain.js'

test('default', () => {
  expect(
    defineChain({
      id: 42220,
      name: 'Celo',
      network: 'celo',
      nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://rpc.ankr.com/celo'] },
      },
    }),
  ).toMatchInlineSnapshot(`
      {
        "fees": undefined,
        "formatters": undefined,
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
        },
        "serializers": undefined,
      }
    `)
})
