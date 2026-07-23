import { tempoModerato } from 'viem/chains'
import { messengerAddresses, zoneModerato } from 'viem/tempo/zones'
import { expectTypeOf, test } from 'vitest'

test('exposes Zone E contracts', () => {
  const contracts = zoneModerato(1).contracts

  expectTypeOf(
    messengerAddresses[tempoModerato.id][1],
  ).toEqualTypeOf<'0x254356112cCf6f32fAd84F16CC5E0A0cCA17Beb7'>()
  expectTypeOf(contracts?.messenger[tempoModerato.id]?.address).toEqualTypeOf<
    `0x${string}` | undefined
  >()
  expectTypeOf(contracts?.portal[tempoModerato.id]?.address).toEqualTypeOf<
    `0x${string}` | undefined
  >()
})
