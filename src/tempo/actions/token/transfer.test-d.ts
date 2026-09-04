import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { transfer } from './transfer.js'
import { transferSync } from './transferSync.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})
const token = '0x20c0000000000000000000000000000000000001'

describe('transfer: token selector', () => {
  test('accepts an address', () => {
    transfer(client, { amount: 1n, to: '0x', token })
    transfer(client, {
      amount: 1n,
      to: '0x',
      token,
    })
  })

  test('rejects a symbol string', () => {
    // @ts-expect-error - token must be an address
    transfer(client, { amount: 1n, to: '0x', token: 'alphaUSD' })
  })
})

describe('transfer: amount', () => {
  test('accepts base units or a formatted helper', () => {
    transfer(client, { amount: 100n, to: '0x', token })
    transfer(client, {
      amount: { decimals: 6, formatted: '1' },
      to: '0x',
      token,
    })
  })

  test('rejects a bare string amount', () => {
    // @ts-expect-error - use base units or a formatted helper
    transfer(client, { amount: '1', to: '0x', token })
  })
})

describe('transfer: return types', () => {
  test('transferSync returns receipt and event data', async () => {
    const result = await transferSync(client, {
      amount: 1n,
      to: '0x',
      token,
    })
    expectTypeOf(result.amount).toEqualTypeOf<bigint>()
    expectTypeOf(result.from).toEqualTypeOf<`0x${string}`>()
    expectTypeOf(result.to).toEqualTypeOf<`0x${string}`>()
    expectTypeOf(result.decimals).toEqualTypeOf<number | undefined>()
    expectTypeOf(result.formatted).toEqualTypeOf<string | undefined>()
  })
})

describe('transfer.call', () => {
  test('with and without a client', () => {
    transfer.call({ amount: 1n, to: '0x', token })
    transfer.call(client, { amount: 1n, to: '0x', token })
  })
})
