import { describe, expect, test } from 'vitest'
import { mainnet, optimism, polygon } from '../chains.js'
import { defineChain, getChainContractAddress } from './chain.js'

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

describe('getChainContractAddress', () => {
  test('default', () => {
    expect(
      getChainContractAddress({
        chain: mainnet,
        contract: 'multicall3',
      }),
    ).toMatchInlineSnapshot('"0xca11bde05977b3631167028862be2a173976ca11"')
    expect(
      getChainContractAddress({
        chain: polygon,
        contract: 'multicall3',
      }),
    ).toMatchInlineSnapshot('"0xca11bde05977b3631167028862be2a173976ca11"')
    expect(
      getChainContractAddress({
        chain: optimism,
        contract: 'multicall3',
      }),
    ).toMatchInlineSnapshot('"0xca11bde05977b3631167028862be2a173976ca11"')
  })

  test('no contract', () => {
    expect(() =>
      getChainContractAddress({
        chain: {
          ...mainnet,
          contracts: {},
        },
        contract: 'multicall3',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Chain \\"Ethereum\\" does not support contract \\"multicall3\\".

      This could be due to any of the following:
      - The chain does not have the contract \\"multicall3\\" configured.

      Version: viem@1.0.2"
    `)
  })

  test('block number is less than created block number', () => {
    expect(() =>
      getChainContractAddress({
        blockNumber: 69420n,
        chain: {
          ...mainnet,
          contracts: {
            multicall3: {
              ...mainnet.contracts.multicall3,
              blockCreated: 123456789,
            },
          },
        },
        contract: 'multicall3',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Chain \\"Ethereum\\" does not support contract \\"multicall3\\".

      This could be due to any of the following:
      - The contract \\"multicall3\\" was not deployed until block 123456789 (current block 69420).

      Version: viem@1.0.2"
    `)
  })
})
