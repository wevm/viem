import { expect, test } from 'vitest'
import { base } from '../chains/definitions/base.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { erc20Abi } from '../constants/abis.js'
import { defineToken } from './defineToken.js'

const token = defineToken({
  abi: erc20Abi,
  addresses: {
    [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
})

test('defines token props', () => {
  expect(token.name).toMatchInlineSnapshot(`"USD Coin"`)
  expect(token.symbol).toMatchInlineSnapshot(`"USDC"`)
  expect(token.decimals).toMatchInlineSnapshot(`6`)
  expect(token.abi).toBe(erc20Abi)
  expect(token.addresses[mainnet.id]).toMatchInlineSnapshot(
    `"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"`,
  )
  expect(token.addresses[base.id]).toMatchInlineSnapshot(
    `"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`,
  )
})

test('resolves by chain id', () => {
  expect(token.address(base.id)).toMatchInlineSnapshot(
    `"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`,
  )
})

test('resolves by chain', () => {
  expect(token.address(base)).toMatchInlineSnapshot(
    `"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`,
  )
})

test('resolves by client', () => {
  const client = { chain: base }
  expect(token.address(client)).toMatchInlineSnapshot(
    `"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`,
  )
})

test('defines contract config', () => {
  const config = token.config(base)
  expect(config.address).toMatchInlineSnapshot(
    `"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`,
  )
  expect(config.abi).toBe(token.abi)
})

test('defines contract config by client', () => {
  const client = { chain: base }
  const config = token.config(client)
  expect(config.address).toMatchInlineSnapshot(
    `"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`,
  )
  expect(config.abi).toBe(token.abi)
})
