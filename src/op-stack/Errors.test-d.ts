import { expectTypeOf, test } from 'vitest'

import * as OpStack from 'viem/op-stack'

test('exports errors by layer', () => {
  expectTypeOf(
    new OpStack.Errors.l1.GameSequenceNotFoundError(),
  ).toEqualTypeOf<OpStack.Errors.l1.GameSequenceNotFoundError>()
  expectTypeOf(
    new OpStack.Errors.l1.WithdrawalNotProvenError(),
  ).toEqualTypeOf<OpStack.Errors.l1.WithdrawalNotProvenError>()
  expectTypeOf(
    new OpStack.Errors.l1.WithdrawalPreparationError(),
  ).toEqualTypeOf<OpStack.Errors.l1.WithdrawalPreparationError>()
  expectTypeOf(
    new OpStack.Errors.l2.StorageProofNotFoundError(),
  ).toEqualTypeOf<OpStack.Errors.l2.StorageProofNotFoundError>()
  expectTypeOf(
    new OpStack.Errors.l2.TimestampMismatchError({
      blockTimestamp: 1n,
      gameTimestamp: 2n,
    }),
  ).toEqualTypeOf<OpStack.Errors.l2.TimestampMismatchError>()
})

test('omits errors from Actions', () => {
  type ActionErrorKey =
    | Extract<keyof typeof OpStack.Actions.l1, `${string}Error`>
    | Extract<keyof typeof OpStack.Actions.l2, `${string}Error`>

  expectTypeOf<ActionErrorKey>().toEqualTypeOf<never>()
})

test('uses lowercase module names', () => {
  type CapitalizedModuleKey = Extract<keyof typeof OpStack.Errors, 'L1' | 'L2'>

  expectTypeOf<CapitalizedModuleKey>().toEqualTypeOf<never>()
})
