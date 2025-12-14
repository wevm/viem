import { describe, expect, expectTypeOf, test } from 'vitest'

import { defineChain, extendSchema } from './defineChain.js'

test('default', () => {
  expect(
    defineChain({
      id: 42220,
      name: 'Celo',
      network: 'celo',
      nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://42220.rpc.thirdweb.com'] },
      },
    }),
  ).toMatchInlineSnapshot(`
      {
        "extend": [Function],
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
              "https://42220.rpc.thirdweb.com",
            ],
          },
        },
        "serializers": undefined,
      }
    `)
})

describe('extend', () => {
  test('default', () => {
    const chain = defineChain({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend(() => ({
      foo: 'bar',
    }))

    expect(extended.foo).toBe('bar')
    expect(extended.id).toBe(1)
    expect(extended.name).toBe('Test')
  })

  test('behavior: schema', () => {
    const chain = defineChain({
      extendSchema: extendSchema<{ foo: string }>(),
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend(() => ({
      foo: 'bar',
    }))

    expect(extended.foo).toBe('bar')
    expect(extended.id).toBe(1)
    expect(extended.name).toBe('Test')
  })

  test('behavior: extend (fn)', () => {
    const chain = defineChain({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend((c) => ({
      anotherId: c.id + 1,
    }))

    expect(extended.id).toBe(1)
    expect(extended.anotherId).toBe(2)
  })

  test('behavior: extend (object)', () => {
    const chain = defineChain({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend({
      feeToken: '0x0000000000000000000000000000000000000000',
    })

    expect(extended.feeToken).toBe('0x0000000000000000000000000000000000000000')
    expect(extended.id).toBe(1)
  })
})
