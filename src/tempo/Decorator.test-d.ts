import { createClient, http } from 'viem'
import { type tempo, tempoLocalnet, type tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import { describe, expectTypeOf, test } from 'vitest'

describe('decorator', () => {
  test('types: attaches `tempo` chain by default', () => {
    const client = createClient({
      transport: http(),
    }).extend(tempoActions())
    expectTypeOf(client.chain).toEqualTypeOf<typeof tempo>()
  })

  test('types: attaches `tempoModerato` chain for testnet', () => {
    const client = createClient({
      transport: http(),
    }).extend(tempoActions({ testnet: true }))
    expectTypeOf(client.chain).toEqualTypeOf<typeof tempoModerato>()
  })

  test('types: preserves explicitly provided chain', () => {
    const client = createClient({
      chain: tempoLocalnet,
      transport: http(),
    }).extend(tempoActions({ testnet: true }))
    expectTypeOf(client.chain).toEqualTypeOf<typeof tempoLocalnet>()
  })
})
