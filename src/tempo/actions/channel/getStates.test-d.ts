import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { getStates } from './getStates.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})

describe('getStates: single vs batch discrimination', () => {
  test('a single channel resolves to one state', () => {
    expectTypeOf(
      getStates(client, { channel: '0x' }),
    ).resolves.toEqualTypeOf<getStates.State>()
  })

  test('a channel list resolves to a state list', () => {
    expectTypeOf(
      getStates(client, { channel: ['0x', '0x'] as const }),
    ).resolves.toEqualTypeOf<readonly getStates.State[]>()
  })
})

describe('getStates: state shape', () => {
  test('state fields', async () => {
    const state = await getStates(client, { channel: '0x' })
    expectTypeOf(state.closeRequestedAt).toEqualTypeOf<number>()
    expectTypeOf(state.deposit).toEqualTypeOf<bigint>()
    expectTypeOf(state.settled).toEqualTypeOf<bigint>()
  })
})
