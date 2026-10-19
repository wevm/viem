import { expect, test } from 'vitest'
import { baseSepolia } from '../../chains/definitions/baseSepolia.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { optimism } from '../../chains/definitions/optimism.js'
import { sepolia } from '../../chains/definitions/sepolia.js'
import { usdc } from '../../tokens/definitions/usdc.js'
import { filterChains } from './filterChains.js'

test('filters chains by token support', () => {
  const chains = filterChains({
    chains: [mainnet, sepolia, { id: 1 }],
    token: usdc,
  })

  expect(chains.map((chain) => chain.id)).toEqual([1, 11155111])
})

test('filters chains by testnet', () => {
  const chains = filterChains({
    chains: [mainnet, sepolia, baseSepolia],
    testnet: true,
  })

  expect(chains.map((chain) => chain.id)).toEqual([11155111, 84532])
})

test('sorts chains by id or name', () => {
  expect(
    filterChains({ chains: [sepolia, mainnet, optimism], sort: 'id' }).map(
      (chain) => chain.id,
    ),
  ).toEqual([1, 10, 11155111])

  expect(
    filterChains({ chains: [sepolia, mainnet, optimism], sort: 'name' }).map(
      (chain) => chain.name,
    ),
  ).toEqual(['Ethereum', 'OP Mainnet', 'Sepolia'])
})
