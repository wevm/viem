import { describe, expect, test } from 'vp/test'

import { Chain } from '../index.js'

describe('define', () => {
  test('behavior: defines a chain with v2-compatible defaults', () => {
    expect(
      Chain.define({
        id: 42220n,
        name: 'Celo',
        network: 'celo',
        nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
        preconfirmationTime: 250,
        rpcUrls: {
          default: { http: ['https://42220.rpc.thirdweb.com'] },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "extend": [Function],
        "formatters": undefined,
        "id": 42220n,
        "name": "Celo",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Celo",
          "symbol": "CELO",
        },
        "network": "celo",
        "preconfirmationTime": 250,
        "rpcUrls": {
          "default": {
            "http": [
              "https://42220.rpc.thirdweb.com",
            ],
          },
        },
      }
    `)
  })

  test('behavior: preserves bigint ids', () => {
    expect(
      Chain.define({
        id: 10n,
        sourceId: 1n,
        name: 'OP Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://mainnet.optimism.io'] },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "extend": [Function],
        "formatters": undefined,
        "id": 10n,
        "name": "OP Mainnet",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "rpcUrls": {
          "default": {
            "http": [
              "https://mainnet.optimism.io",
            ],
          },
        },
        "sourceId": 1n,
      }
    `)
  })

  test('behavior: extends with objects and functions', () => {
    const chain = Chain.define({
      extendSchema: Chain.extendSchema<{ feeToken: `0x${string}` }>(),
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend({
      feeToken: '0x0000000000000000000000000000000000000000',
    })
    const extendedAgain = extended.extend((chain) => ({
      displayName: `${chain.name} (${chain.feeToken})`,
    }))

    expect(extended).toMatchInlineSnapshot(`
      {
        "extend": [Function],
        "extendSchema": {},
        "feeToken": "0x0000000000000000000000000000000000000000",
        "formatters": undefined,
        "id": 1n,
        "name": "Test",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "rpcUrls": {
          "default": {
            "http": [
              "https://localhost:8545",
            ],
          },
        },
      }
    `)
    expect(extendedAgain.displayName).toMatchInlineSnapshot(
      `"Test (0x0000000000000000000000000000000000000000)"`,
    )
  })

  test('behavior: uses directional formatter entries', () => {
    const chain = Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
      formatters: {
        block: {
          type: 'block',
          fromRpc: (value: unknown) => ({ value }),
        },
        transactionRequest: {
          type: 'transactionRequest',
          toRpc: (value: unknown) => ({ value }),
        },
      },
    })

    expect(chain.formatters.block?.fromRpc?.('rpc block'))
      .toMatchInlineSnapshot(`
        {
          "value": "rpc block",
        }
      `)
    expect(chain.formatters.transactionRequest?.toRpc?.('request'))
      .toMatchInlineSnapshot(`
        {
          "value": "request",
        }
      `)
  })
})

describe('extendSchema', () => {
  test('behavior: returns a type marker', () => {
    expect(Chain.extendSchema<{ foo: string }>()).toMatchInlineSnapshot('{}')
  })
})
