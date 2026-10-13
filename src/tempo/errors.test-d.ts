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
  }
  if (error.name === 'AccessKeyExpiredError')
    expectTypeOf(error.expiry).toEqualTypeOf<bigint | undefined>()
  if (error.name === 'AccessKeyCallNotAllowedError')
    expectTypeOf(error.selector).toEqualTypeOf<Hex | undefined>()
  if (error.name === 'TempoExecutionError') {
    expectTypeOf(error.errorName).toEqualTypeOf<TempoExecutionError.ErrorName>()
    expectTypeOf(error.hints).toEqualTypeOf<readonly string[]>()
  }
})

test('sync and async variants share error types', () => {
  expectTypeOf<Actions.amm.mintSync.ErrorType>().toEqualTypeOf<Actions.amm.mint.ErrorType>()
})
