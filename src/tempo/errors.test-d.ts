import { expectTypeOf, test } from 'vitest'

import * as Tempo from 'viem/tempo'

test('exports flat errors', () => {
  expectTypeOf(Tempo.FeeTokenNotTip20Error).not.toBeAny()
  expectTypeOf(Tempo.FeeTokenNotUsdError).not.toBeAny()
  expectTypeOf(Tempo.FeeTokenPausedError).not.toBeAny()
  expectTypeOf(Tempo.GetVaultEngineChangedError).not.toBeAny()
  expectTypeOf(Tempo.InvalidFeeTokenError).not.toBeAny()
  expectTypeOf(Tempo.WaitForPrivateDepositTimeoutError).not.toBeAny()
  expectTypeOf(Tempo.WaitForPrivateRedeemTimeoutError).not.toBeAny()
})

test('omits the action error facade', () => {
  type RootErrorKey = Extract<
    keyof typeof Tempo,
    'Errors' | 'WaitForTempoBlockTimeoutError'
  >

  expectTypeOf<RootErrorKey>().toEqualTypeOf<never>()
})
