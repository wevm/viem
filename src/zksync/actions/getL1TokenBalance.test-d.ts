import { expectTypeOf, test } from 'vitest'

import type { ReadContractErrorType } from '../../actions/public/readContract.js'
import type { GetL1TokenBalanceErrorType } from './getL1TokenBalance.js'

test('includes readContract errors', () => {
  const propagated: GetL1TokenBalanceErrorType = {} as ReadContractErrorType

  expectTypeOf(propagated).toExtend<GetL1TokenBalanceErrorType>()
})

test('retains contract error discriminants', () => {
  const error = {} as GetL1TokenBalanceErrorType
  if (error.name !== 'ContractFunctionExecutionError') return

  expectTypeOf(error.functionName).toEqualTypeOf<string>()
  expectTypeOf(error.contractAddress).toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf(error.cause).toEqualTypeOf<ReadContractErrorType['cause']>()
})
