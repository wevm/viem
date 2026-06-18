import { describe, expect, test } from 'vitest'

import { mainnet } from './definitions/mainnet.js'
import { optimism } from './definitions/optimism.js'
import {
  assertCurrentChain,
  ChainDoesNotSupportContract,
  ChainMismatchError,
  ChainNotFoundError,
  extractChain,
  getChainContractAddress,
} from './utils.js'

describe('extractChain', () => {
  test('extracts a chain by id', () => {
    const chain = extractChain({ chains: [mainnet, optimism], id: 10 })
    expect(chain.id).toBe(10)
    expect(chain.name).toBe('OP Mainnet')
  })
})

describe('getChainContractAddress', () => {
  test('returns the contract address', () => {
    expect(
      getChainContractAddress({ chain: mainnet, contract: 'multicall3' }),
    ).toBe('0xca11bde05977b3631167028862be2a173976ca11')
  })

  test('throws when the contract is not configured', () => {
    expect(() =>
      getChainContractAddress({ chain: mainnet, contract: 'unknown' }),
    ).toThrow(ChainDoesNotSupportContract)
  })

  test('throws when the contract is not yet deployed at the block', () => {
    expect(() =>
      getChainContractAddress({
        blockNumber: 1n,
        chain: mainnet,
        contract: 'multicall3',
      }),
    ).toThrow(ChainDoesNotSupportContract)
  })
})

describe('assertCurrentChain', () => {
  test('passes when chain ids match', () => {
    expect(() =>
      assertCurrentChain({ chain: mainnet, currentChainId: 1 }),
    ).not.toThrow()
  })

  test('throws when no chain is provided', () => {
    expect(() =>
      assertCurrentChain({ chain: undefined, currentChainId: 1 }),
    ).toThrow(ChainNotFoundError)
  })

  test('throws when chain ids mismatch', () => {
    expect(() =>
      assertCurrentChain({ chain: mainnet, currentChainId: 10 }),
    ).toThrow(ChainMismatchError)
  })
})
