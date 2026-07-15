import { expectTypeOf, test } from 'vitest'

import { Actions, Errors } from 'viem'

test('exports errors by Action domain', () => {
  expectTypeOf<
    keyof typeof Actions.block.Errors
  >().toEqualTypeOf<'BlockNotFoundError'>()
  expectTypeOf<keyof typeof Actions.ens.Errors>().toEqualTypeOf<
    | 'EnsAvatarInvalidMetadataError'
    | 'EnsAvatarInvalidNftUriError'
    | 'EnsAvatarUnsupportedNamespaceError'
    | 'EnsAvatarUriResolutionError'
  >()
  expectTypeOf<keyof typeof Actions.erc7821.Errors>().toEqualTypeOf<
    'ExecuteUnsupportedError' | 'FunctionSelectorNotRecognizedError'
  >()
  expectTypeOf<keyof typeof Actions.fee.Errors>().toEqualTypeOf<
    'BaseFeeScalarError' | 'Eip1559FeesNotSupportedError'
  >()
  expectTypeOf<keyof typeof Actions.transaction.Errors>().toEqualTypeOf<
    | 'MaxFeePerGasTooLowError'
    | 'TransactionNotFoundError'
    | 'TransactionReceiptNotFoundError'
    | 'WaitForReceiptTimeoutError'
  >()
  expectTypeOf<keyof typeof Actions.wallet.Errors>().toEqualTypeOf<
    | 'AtomicityNotSupportedError'
    | 'BundleFailedError'
    | 'UnsupportedNonOptionalCapabilityError'
    | 'WaitForCallsStatusTimeoutError'
  >()

  type ErrorType =
    | Actions.block.Errors.BlockNotFoundError
    | Actions.ens.Errors.EnsAvatarInvalidMetadataError
    | Actions.ens.Errors.EnsAvatarInvalidNftUriError
    | Actions.ens.Errors.EnsAvatarUnsupportedNamespaceError
    | Actions.ens.Errors.EnsAvatarUriResolutionError
    | Actions.erc7821.Errors.ExecuteUnsupportedError
    | Actions.erc7821.Errors.FunctionSelectorNotRecognizedError
    | Actions.fee.Errors.BaseFeeScalarError
    | Actions.fee.Errors.Eip1559FeesNotSupportedError
    | Actions.transaction.Errors.MaxFeePerGasTooLowError
    | Actions.transaction.Errors.TransactionNotFoundError
    | Actions.transaction.Errors.TransactionReceiptNotFoundError
    | Actions.transaction.Errors.WaitForReceiptTimeoutError
    | Actions.wallet.Errors.AtomicityNotSupportedError
    | Actions.wallet.Errors.BundleFailedError
    | Actions.wallet.Errors.UnsupportedNonOptionalCapabilityError
    | Actions.wallet.Errors.WaitForCallsStatusTimeoutError

  expectTypeOf<ErrorType>().toMatchTypeOf<Errors.BaseError>()
})

test('omits flat error exports from Action domains', () => {
  type FlatErrorKey =
    | Extract<keyof typeof Actions.block, `${string}Error`>
    | Extract<keyof typeof Actions.ens, `${string}Error`>
    | Extract<keyof typeof Actions.erc7821, `${string}Error`>
    | Extract<keyof typeof Actions.fee, `${string}Error`>
    | Extract<keyof typeof Actions.transaction, `${string}Error`>
    | Extract<keyof typeof Actions.wallet, `${string}Error`>

  expectTypeOf<FlatErrorKey>().toEqualTypeOf<never>()
})

test('omits Action domains from the root Errors module', () => {
  type ActionDomainKey = Extract<
    keyof typeof Errors,
    | 'block'
    | 'ens'
    | 'erc7821'
    | 'fee'
    | 'transaction'
    | 'transactionReceipt'
    | 'wallet'
  >

  expectTypeOf<ActionDomainKey>().toEqualTypeOf<never>()
})
