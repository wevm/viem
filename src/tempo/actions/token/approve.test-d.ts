import type * as Hex from 'ox/Hex'
import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { approve } from './approve.js'
import { approveSync } from './approveSync.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})

describe('approve: token selector', () => {
  test('accepts a token id or address', () => {
    approve(client, { amount: 1n, spender: '0x', token: 1n })
    approve(client, {
      amount: 1n,
      spender: '0x',
      token: '0x20c0000000000000000000000000000000000001',
    })
  })

  test('rejects a symbol string', () => {
    // @ts-expect-error - token must be a token id or address
    approve(client, { amount: 1n, spender: '0x', token: 'alphaUSD' })
  })

  test('requires `token`', () => {
    // @ts-expect-error - must provide `token`
    approve(client, { amount: 1n, spender: '0x' })
  })
})

describe('approve: amount', () => {
  test('accepts base units or a formatted helper', () => {
    approve(client, { amount: 100n, spender: '0x', token: 1n })
    approve(client, { amount: { formatted: '1' }, spender: '0x', token: 1n })
    approve(client, {
      amount: { decimals: 6, formatted: '1' },
      spender: '0x',
      token: 1n,
    })
  })

  test('rejects a bare string amount', () => {
    // @ts-expect-error - use base units or a formatted helper
    approve(client, { amount: '1', spender: '0x', token: 1n })
  })

  test('rejects top-level `decimals`', () => {
    approve(client, {
      // @ts-expect-error - pass decimals under `amount` for formatted amounts
      decimals: 6,
      amount: { formatted: '1' },
      spender: '0x',
      token: 1n,
    })
  })
})

describe('approve: return types', () => {
  test('approve returns the transaction hash', () => {
    expectTypeOf(
      approve(client, { amount: 1n, spender: '0x', token: 1n }),
    ).resolves.toEqualTypeOf<Hex.Hex>()
  })

  test('approveSync returns receipt and event data', async () => {
    const result = await approveSync(client, {
      amount: 1n,
      spender: '0x',
      token: 1n,
    })
    expectTypeOf(result.amount).toEqualTypeOf<bigint>()
    expectTypeOf(result.decimals).toEqualTypeOf<number | undefined>()
    expectTypeOf(result.formatted).toEqualTypeOf<string | undefined>()
    expectTypeOf(result.receipt).not.toBeAny()
  })
})

describe('approve.call', () => {
  test('with and without a client', () => {
    approve.call({ amount: 1n, spender: '0x', token: 1n })
    approve.call(client, { amount: 1n, spender: '0x', token: 1n })
  })
})
