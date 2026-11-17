import { expectTypeOf, test } from 'vitest'

import * as Tempo from 'viem/tempo'
import type { Address, Hex } from 'viem/utils'

test('exports flat errors', () => {
  expectTypeOf(Tempo.FeeTokenNotTip20Error).not.toBeAny()
  expectTypeOf(Tempo.FeeTokenNotUsdError).not.toBeAny()
  expectTypeOf(Tempo.FeeTokenPausedError).not.toBeAny()
  expectTypeOf(Tempo.GetVaultEngineChangedError).not.toBeAny()
  expectTypeOf(Tempo.InvalidFeeTokenError).not.toBeAny()
  expectTypeOf(Tempo.TempoExecutionError).not.toBeAny()
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

test('narrows action errors by name', () => {
  const error = {} as Tempo.Actions.token.transferSync.ErrorType

  if (error.name === 'AccessKeySpendingLimitExceededError') {
    expectTypeOf(error.accessKey).toEqualTypeOf<Address.Address>()
    expectTypeOf(error.amount).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(error.remaining).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(error.periodEnd).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(error.fee).toEqualTypeOf<boolean>()
    expectTypeOf(error.errorName).toEqualTypeOf<'SpendingLimitExceeded'>()
  }
  if (error.name === 'AccessKeyCallNotAllowedError')
    expectTypeOf(error.selector).toEqualTypeOf<Hex.Hex | undefined>()
  if (error.name === 'TokenInsufficientBalanceError') {
    expectTypeOf(error.available).toEqualTypeOf<bigint>()
    expectTypeOf(error.token).toEqualTypeOf<Address.Address>()
  }
  if (error.name === 'DexOrderNotFoundError')
    expectTypeOf(error.orderId).toEqualTypeOf<bigint>()
  if (error.name === 'TempoExecutionError') {
    expectTypeOf(
      error.errorName,
    ).toEqualTypeOf<Tempo.TempoExecutionError.ErrorName>()
    expectTypeOf(error.hints).toEqualTypeOf<readonly string[]>()
  }
})

test('narrows args by error name', () => {
  const error = {} as Tempo.Actions.token.transferSync.ErrorType
  if (error.name !== 'TempoExecutionError') return

  if (error.errorName === 'StaleLeadershipEpoch')
    expectTypeOf(error.args).toEqualTypeOf<
      readonly [expected: bigint, actual: bigint] | undefined
    >()
  if (error.errorName === 'KeyNotFound')
    expectTypeOf(error.args).toEqualTypeOf<undefined>()
})

test('sync and async variants share error types', () => {
  expectTypeOf<Tempo.Actions.amm.mintSync.ErrorType>().toEqualTypeOf<Tempo.Actions.amm.mint.ErrorType>()
})
