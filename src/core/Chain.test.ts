import { describe, expect, test } from 'vitest'

import * as Chain from './Chain.js'

describe('from', () => {
  test('default', () => {
    expect(
      Chain.from({
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
      }),
    ).toMatchInlineSnapshot(`
      {
        "extend": [Function],
        "id": 1,
        "name": "Ethereum",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "rpcUrls": {
          "default": {
            "http": [
              "https://eth.merkle.io",
            ],
          },
        },
      }
    `)
  })

  test('behavior: extend', () => {
    const chain = Chain.from({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend({ name: 'Test 2', testnet: true })

    expect(extended.id).toBe(1)
    expect(extended.name).toBe('Test 2')
    expect(extended.testnet).toBe(true)
  })

  test('behavior: extend is chainable', () => {
    const chain = Chain.from({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })
      .extend({ testnet: true })
      .extend({ sourceId: 10 })

    expect(chain.testnet).toBe(true)
    expect(chain.sourceId).toBe(10)
  })
})
