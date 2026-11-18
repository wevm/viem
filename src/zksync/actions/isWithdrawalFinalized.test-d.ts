import type {
  GetTransactionReceiptErrorType,
  ReadContractErrorType,
} from 'viem'
import type { IsWithdrawalFinalizedErrorType } from 'viem/zksync'
import { expectTypeOf, test } from 'vitest'

test('includes receipt, RPC, and contract errors', () => {
  expectTypeOf<GetTransactionReceiptErrorType>().toExtend<IsWithdrawalFinalizedErrorType>()
  expectTypeOf<ReadContractErrorType>().toExtend<IsWithdrawalFinalizedErrorType>()
})

test('retains RPC and contract error discriminants', () => {
  const error = {} as IsWithdrawalFinalizedErrorType

  if (error.name === 'HttpRequestError') {
    expectTypeOf(error.status).toEqualTypeOf<number | undefined>()
    expectTypeOf(error.url).toEqualTypeOf<string>()
  }
  if (error.name === 'ContractFunctionExecutionError') {
    expectTypeOf(error.functionName).toEqualTypeOf<string>()
    expectTypeOf(error.contractAddress).toEqualTypeOf<
      `0x${string}` | undefined
    >()
  }
})
