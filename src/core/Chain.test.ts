import { describe, expect, test } from 'vitest'

import { Chain } from 'viem'

import { base } from '../chains/definitions/base.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { optimism } from '../chains/definitions/optimism.js'
import { tempo } from '../chains/definitions/tempo.js'
import { tempoDevnet } from '../chains/definitions/tempoDevnet.js'
import { tempoLocalnet } from '../chains/definitions/tempoLocalnet.js'
import { tempoModerato as tempoTestnet } from '../chains/definitions/tempoModerato.js'

describe('from', () => {
  test('default', () => {
    expect(
      Chain.from({
        id: 1,
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { http: 'https://eth.merkle.io' },
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
          "http": "https://eth.merkle.io",
        },
      }
    `)
  })

  test('behavior: extend', () => {
    const chain = Chain.from({
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { http: 'https://localhost:8545' },
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
      rpcUrls: { http: 'https://localhost:8545' },
    })
      .extend({ testnet: true })
      .extend({ sourceId: 10 })

    expect(chain.testnet).toBe(true)
    expect(chain.sourceId).toBe(10)
  })
})

describe('extract', () => {
  test('extracts a chain by id', () => {
    const chain = Chain.extract({ chains: [mainnet, optimism], id: 10 })
    expect(chain.id).toBe(10)
    expect(chain.name).toBe('OP Mainnet')
  })
})

describe('getContractAddress', () => {
  test('returns the CREATE2 deployer address', () => {
    expect(
      Chain.getContractAddress({ chain: mainnet, contract: 'create2' }),
    ).toMatchInlineSnapshot(`"0x4e59b44847b379578588920ca78fbf26c0b4956c"`)
  })

  test('returns the Tempo CREATE2 deployer contracts', () => {
    expect(
      [tempo, tempoTestnet, tempoDevnet, tempoLocalnet].map((chain) => ({
        contract: chain.contracts.create2,
        id: chain.id,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "contract": {
            "address": "0x4e59b44847b379578588920ca78fbf26c0b4956c",
            "blockCreated": 0,
          },
          "id": 4217,
        },
        {
          "contract": {
            "address": "0x4e59b44847b379578588920ca78fbf26c0b4956c",
            "blockCreated": 0,
          },
          "id": 42431,
        },
        {
          "contract": {
            "address": "0x4e59b44847b379578588920ca78fbf26c0b4956c",
            "blockCreated": 0,
          },
          "id": 31318,
        },
        {
          "contract": {
            "address": "0x4e59b44847b379578588920ca78fbf26c0b4956c",
            "blockCreated": 0,
          },
          "id": 1337,
        },
      ]
    `)
  })

  test('returns the contract address', () => {
    expect(
      Chain.getContractAddress({ chain: mainnet, contract: 'multicall3' }),
    ).toBe('0xca11bde05977b3631167028862be2a173976ca11')
  })

  test('throws when the contract is not configured', () => {
    expect(() =>
      Chain.getContractAddress({ chain: mainnet, contract: 'unknown' }),
    ).toThrow(Chain.DoesNotSupportContract)
  })

  test('throws when the contract is keyed by source chain', () => {
    expect(() => Chain.getContractAddress({ chain: base, contract: 'portal' }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Chain.DoesNotSupportContract: Chain "Base" does not support contract "portal".

      This could be due to any of the following:
      - The chain does not have the contract "portal" configured.

      Version: viem@2.52.1]
    `)
  })

  test('throws when the contract is not yet deployed at the block', () => {
    expect(() =>
      Chain.getContractAddress({
        blockNumber: 1n,
        chain: mainnet,
        contract: 'multicall3',
      }),
    ).toThrow(Chain.DoesNotSupportContract)
  })
})

describe('assertCurrent', () => {
  test('passes when chain ids match', () => {
    expect(() =>
      Chain.assertCurrent({ chain: mainnet, currentChainId: 1 }),
    ).not.toThrow()
  })

  test('throws when no chain is provided', () => {
    expect(() =>
      Chain.assertCurrent({ chain: undefined, currentChainId: 1 }),
    ).toThrow(Chain.NotFoundError)
  })

  test('throws when chain ids mismatch', () => {
    expect(() =>
      Chain.assertCurrent({ chain: mainnet, currentChainId: 10 }),
    ).toThrow(Chain.MismatchError)
  })
})
