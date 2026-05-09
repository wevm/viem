import * as AbiParameters from 'ox/AbiParameters'

import type { ErrorType } from '../../../errors/utils.js'
import type { Call, Calls } from '../../../types/calls.js'
import type { Hex } from '../../../types/misc.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'

export type EncodeCallsErrorType =
  | AbiParameters.encode.ErrorType
  | AbiParameters.from.ErrorType
  | EncodeFunctionDataErrorType
  | ErrorType

export function encodeCalls(
  calls_: Calls<readonly unknown[]>,
  opData?: Hex | undefined,
) {
  const calls = calls_.map((call_) => {
    const call = call_ as Call
    return {
      data: call.abi ? encodeFunctionData(call) : (call.data ?? '0x'),
      value: call.value ?? 0n,
      target: call.to,
    }
  })

  return AbiParameters.encode(
    AbiParameters.from([
      'struct Call { address target; uint256 value; bytes data; }',
      'Call[] calls',
      ...(opData ? ['bytes opData'] : []),
    ]),
    [calls, ...(opData ? [opData] : [])] as any,
  )
}
