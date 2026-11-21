import type { ReadContractErrorType } from 'viem'
import type { GetL1TokenBalanceErrorType } from 'viem/zksync'
import { expectTypeOf, test } from 'vitest'

test('includes readContract errors', () => {
  expectTypeOf<ReadContractErrorType>().toExtend<GetL1TokenBalanceErrorType>()
})

test('retains contract error discriminants', () => {
  const error = {} as GetL1TokenBalanceErrorType
  if (error.name !== 'ContractFunctionExecutionError') return

  expectTypeOf(error.functionName).toEqualTypeOf<string>()
  expectTypeOf(error.contractAddress).toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf(error.cause).toEqualTypeOf<ReadContractErrorType['cause']>()
})
