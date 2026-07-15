import { expectTypeOf, test } from 'vitest'

import * as Tempo from 'viem/tempo'

test('exports flat errors through Errors', () => {
  expectTypeOf(Tempo.Errors.FeeTokenNotTip20Error).toEqualTypeOf<
    typeof Tempo.FeeTokenNotTip20Error
  >()
  expectTypeOf(Tempo.Errors.FeeTokenNotUsdError).toEqualTypeOf<
    typeof Tempo.FeeTokenNotUsdError
  >()
  expectTypeOf(Tempo.Errors.FeeTokenPausedError).toEqualTypeOf<
    typeof Tempo.FeeTokenPausedError
  >()
  expectTypeOf(Tempo.Errors.InvalidFeeTokenError).toEqualTypeOf<
    typeof Tempo.InvalidFeeTokenError
  >()
  expectTypeOf(
    new Tempo.Errors.zone.WaitForDepositStatusTimeoutError({
      tempoBlockNumber: 1n,
    }),
  ).toEqualTypeOf<Tempo.Errors.zone.WaitForDepositStatusTimeoutError>()
})

test('omits the timeout error from legacy paths', () => {
  type ActionErrorKey = Extract<
    keyof typeof Tempo.Actions.zone,
    `${string}Error`
  >
  type RootErrorKey = Extract<
    keyof typeof Tempo,
    'WaitForDepositStatusTimeoutError' | 'zone'
  >
  type CapitalizedModuleKey = Extract<keyof typeof Tempo.Errors, 'Zone'>

  expectTypeOf<ActionErrorKey>().toEqualTypeOf<never>()
  expectTypeOf<CapitalizedModuleKey>().toEqualTypeOf<never>()
  expectTypeOf<RootErrorKey>().toEqualTypeOf<never>()
})
