import type { Hex } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { place } from './place.js'
import { placeSync } from './placeSync.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})

describe('place: options', () => {
  test('accepts a token address', () => {
    place(client, { amount: 1n, tick: 0, token: '0x20c0000000000000000000000000000000000001', type: 'buy' })
    place(client, {
      amount: 1n,
      tick: 0,
      token: '0x20c0000000000000000000000000000000000001',
      type: 'sell',
    })
  })

  test('rejects an invalid order type', () => {
    // @ts-expect-error - type must be 'buy' or 'sell'
    place(client, { amount: 1n, tick: 0, token: '0x20c0000000000000000000000000000000000001', type: 'hold' })
  })

  test('requires `tick`', () => {
    // @ts-expect-error - must provide `tick`
    place(client, { amount: 1n, token: '0x20c0000000000000000000000000000000000001', type: 'buy' })
  })
})

describe('place: return types', () => {
  test('place returns the transaction hash', () => {
    expectTypeOf(
      place(client, { amount: 1n, tick: 0, token: '0x20c0000000000000000000000000000000000001', type: 'buy' }),
    ).resolves.toEqualTypeOf<Hex.Hex>()
  })

  test('placeSync returns receipt and event data', async () => {
    const result = await placeSync(client, {
      amount: 1n,
      tick: 0,
      token: '0x20c0000000000000000000000000000000000001',
      type: 'buy',
    })
    expectTypeOf(result.orderId).toEqualTypeOf<bigint>()
    expectTypeOf(result.tick).toEqualTypeOf<number>()
    expectTypeOf(result.receipt).not.toBeAny()
  })
})

describe('place.call', () => {
  test('with and without a client', () => {
    place.call({ amount: 1n, tick: 0, token: '0x20c0000000000000000000000000000000000001', type: 'buy' })
    place.call(client, { amount: 1n, tick: 0, token: '0x20c0000000000000000000000000000000000001', type: 'buy' })
  })
})
