import { expectTypeOf, test } from 'vitest'

import * as Tempo from 'viem/tempo'

test('exports flat errors', () => {
  expectTypeOf(Tempo.FeeTokenNotTip20Error).not.toBeAny()
  expectTypeOf(Tempo.FeeTokenNotUsdError).not.toBeAny()
  expectTypeOf(Tempo.FeeTokenPausedError).not.toBeAny()
  expectTypeOf(Tempo.InvalidFeeTokenError).not.toBeAny()
})

test('omits the action error facade', () => {
  type RootErrorKey = Extract<
    keyof typeof Tempo,
    'Errors' | 'WaitForDepositStatusTimeoutError'
  >

  expectTypeOf<RootErrorKey>().toEqualTypeOf<never>()
})
