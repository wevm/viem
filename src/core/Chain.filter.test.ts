import { expect, test } from 'vitest'

import { Chain } from 'viem'
import { baseSepolia, mainnet, optimism, sepolia } from 'viem/chains'
import { usdc } from 'viem/tokens'

test('filters chains by token support', () => {
  const chains = Chain.filter({
    chains: [mainnet, sepolia, { id: 10 }, { name: 'no-id' }],
    token: usdc,
  })

  expect(chains.map((chain) => chain.id)).toMatchInlineSnapshot(`
    [
      1,
      11155111,
      10,
    ]
  `)
})

test('filters chains by testnet', () => {
  const chains = Chain.filter({
    chains: [mainnet, sepolia, baseSepolia],
    testnet: true,
  })

  expect(chains.map((chain) => chain.id)).toMatchInlineSnapshot(`
    [
      11155111,
      84532,
    ]
  `)
})

test('sorts chains by id or name', () => {
  expect(
    Chain.filter({ chains: [sepolia, mainnet, optimism], sort: 'id' }).map(
      (chain) => chain.id,
    ),
  ).toMatchInlineSnapshot(`
    [
      1,
      10,
      11155111,
    ]
  `)

  expect(
    Chain.filter({ chains: [sepolia, mainnet, optimism], sort: 'name' }).map(
      (chain) => chain.name,
    ),
  ).toMatchInlineSnapshot(`
    [
      "Ethereum",
      "OP Mainnet",
      "Sepolia",
    ]
  `)
})
