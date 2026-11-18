import { expectTypeOf, test } from 'vitest'

import type { GetTransactionReceiptErrorType } from '../../actions/public/getTransactionReceipt.js'
import type { ReadContractErrorType } from '../../actions/public/readContract.js'
import type { IsWithdrawalFinalizedErrorType } from './isWithdrawalFinalized.js'

test('includes receipt and contract errors', () => {
  const receiptError: IsWithdrawalFinalizedErrorType =
    {} as GetTransactionReceiptErrorType
  const contractError: IsWithdrawalFinalizedErrorType =
    {} as ReadContractErrorType

  expectTypeOf(receiptError).toExtend<IsWithdrawalFinalizedErrorType>()
  expectTypeOf(contractError).toExtend<IsWithdrawalFinalizedErrorType>()
})

test('retains receipt and contract error discriminants', () => {
  const error = {} as IsWithdrawalFinalizedErrorType

  if (error.name === 'TransactionReceiptNotFoundError')
    expectTypeOf(error.name).toEqualTypeOf<'TransactionReceiptNotFoundError'>()

  if (error.name === 'ContractFunctionExecutionError') {
    expectTypeOf(error.functionName).toEqualTypeOf<string>()
    expectTypeOf(error.contractAddress).toEqualTypeOf<
      `0x${string}` | undefined
    >()
  }
})
