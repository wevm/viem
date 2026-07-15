import { expectTypeOf, test } from 'vitest'

import { Actions, Errors } from 'viem'

test('exports semantic error types', () => {
  expectTypeOf<keyof typeof Errors.block>().toEqualTypeOf<'NotFoundError'>()
  expectTypeOf<keyof typeof Errors.ens>().toEqualTypeOf<
    | 'AvatarInvalidMetadataError'
    | 'AvatarInvalidNftUriError'
    | 'AvatarUnsupportedNamespaceError'
    | 'AvatarUriResolutionError'
  >()
  expectTypeOf<keyof typeof Errors.erc7821>().toEqualTypeOf<
    'ExecuteUnsupportedError' | 'FunctionSelectorNotRecognizedError'
  >()
  expectTypeOf<keyof typeof Errors.fee>().toEqualTypeOf<
    'BaseFeeScalarError' | 'Eip1559FeesNotSupportedError'
  >()
  expectTypeOf<keyof typeof Errors.transaction>().toEqualTypeOf<
    'MaxFeePerGasTooLowError' | 'NotFoundError' | 'WaitForReceiptTimeoutError'
  >()
  expectTypeOf<
    keyof typeof Errors.transactionReceipt
  >().toEqualTypeOf<'NotFoundError'>()
  expectTypeOf<keyof typeof Errors.wallet>().toEqualTypeOf<
    | 'AtomicityNotSupportedError'
    | 'BundleFailedError'
    | 'UnsupportedNonOptionalCapabilityError'
    | 'WaitForCallsStatusTimeoutError'
  >()

  type ErrorType =
    | Errors.block.NotFoundError
    | Errors.ens.AvatarInvalidMetadataError
    | Errors.ens.AvatarInvalidNftUriError
    | Errors.ens.AvatarUnsupportedNamespaceError
    | Errors.ens.AvatarUriResolutionError
    | Errors.erc7821.ExecuteUnsupportedError
    | Errors.erc7821.FunctionSelectorNotRecognizedError
    | Errors.fee.BaseFeeScalarError
    | Errors.fee.Eip1559FeesNotSupportedError
    | Errors.transaction.MaxFeePerGasTooLowError
    | Errors.transaction.NotFoundError
    | Errors.transaction.WaitForReceiptTimeoutError
    | Errors.transactionReceipt.NotFoundError
    | Errors.wallet.AtomicityNotSupportedError
    | Errors.wallet.BundleFailedError
    | Errors.wallet.UnsupportedNonOptionalCapabilityError
    | Errors.wallet.WaitForCallsStatusTimeoutError

  expectTypeOf<ErrorType>().toMatchTypeOf<Errors.BaseError>()
})

test('omits error types from Actions', () => {
  type ActionErrorKey =
    | Extract<keyof typeof Actions.block, `${string}Error`>
    | Extract<keyof typeof Actions.ens, `${string}Error`>
    | Extract<keyof typeof Actions.erc7821, `${string}Error`>
    | Extract<keyof typeof Actions.fee, `${string}Error`>
    | Extract<keyof typeof Actions.transaction, `${string}Error`>
    | Extract<keyof typeof Actions.wallet, `${string}Error`>

  expectTypeOf<ActionErrorKey>().toEqualTypeOf<never>()
})

test('uses lowercase module names', () => {
  type CapitalizedModuleKey = Extract<
    keyof typeof Errors,
    | 'Block'
    | 'Ens'
    | 'Erc7821'
    | 'Fee'
    | 'Transaction'
    | 'TransactionReceipt'
    | 'Wallet'
  >

  expectTypeOf<CapitalizedModuleKey>().toEqualTypeOf<never>()
})
