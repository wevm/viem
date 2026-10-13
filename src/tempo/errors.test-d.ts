import type { Address, Hex } from 'viem'
import type { Actions, TempoExecutionError } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('narrows action errors by name', () => {
  const error = {} as Actions.token.transferSync.ErrorType

  if (error.name === 'AccessKeySpendingLimitExceededError') {
    expectTypeOf(error.accessKey).toEqualTypeOf<Address>()
    expectTypeOf(error.amount).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(error.remaining).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(error.periodEnd).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(error.fee).toEqualTypeOf<boolean>()
    expectTypeOf(error.errorName).toEqualTypeOf<'SpendingLimitExceeded'>()
  }
  if (error.name === 'AccessKeyCallNotAllowedError')
    expectTypeOf(error.selector).toEqualTypeOf<Hex | undefined>()
  if (error.name === 'TokenInsufficientBalanceError') {
    expectTypeOf(error.available).toEqualTypeOf<bigint>()
    expectTypeOf(error.token).toEqualTypeOf<Address>()
  }
  if (error.name === 'DexOrderNotFoundError')
    expectTypeOf(error.orderId).toEqualTypeOf<bigint>()
  if (error.name === 'TempoExecutionError') {
    expectTypeOf(
      error.errorName,
    ).toEqualTypeOf<TempoExecutionError.ErrorName>()
    expectTypeOf(error.hints).toEqualTypeOf<readonly string[]>()
  }
})

test('narrows args by error name', () => {
  const error = {} as Actions.token.transferSync.ErrorType
  if (error.name !== 'TempoExecutionError') return

  if (error.errorName === 'StaleLeadershipEpoch')
    expectTypeOf(error.args).toEqualTypeOf<
      readonly [expected: bigint, actual: bigint] | undefined
    >()
  if (error.errorName === 'KeyNotFound')
    expectTypeOf(error.args).toEqualTypeOf<readonly [] | undefined>()
})

test('sync and async variants share error types', () => {
  expectTypeOf<
    Actions.amm.mintSync.ErrorType
  >().toEqualTypeOf<Actions.amm.mint.ErrorType>()
})
