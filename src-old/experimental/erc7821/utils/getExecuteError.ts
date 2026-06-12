import type { Abi, Narrow } from 'abitype'
import * as AbiError from 'ox/AbiError'

import type { BaseError } from '../../../errors/base.js'
import type { Call, Calls } from '../../../types/calls.js'
import type { Hex } from '../../../types/misc.js'
import { decodeErrorResult } from '../../../utils/abi/decodeErrorResult.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../../utils/errors/getContractError.js'
import {
  FunctionSelectorNotRecognizedError,
  type FunctionSelectorNotRecognizedErrorType,
} from '../errors.js'

export type GetExecuteErrorParameters<
  calls extends readonly unknown[] = readonly unknown[],
> = {
  /** Calls to execute. */
  calls: Calls<Narrow<calls>>
}

export type GetExecuteErrorReturnType =
  | FunctionSelectorNotRecognizedErrorType
  | GetContractErrorReturnType

export function getExecuteError<const calls extends readonly unknown[]>(
  e: BaseError,
  parameters: GetExecuteErrorParameters<calls>,
): GetExecuteErrorReturnType {
  const error = e.walk((e) => 'data' in (e as Error)) as
    | (BaseError & { data?: Hex | undefined })
    | undefined

  if (!error?.data) return e as never
  if (
    error.data ===
    AbiError.getSelector(AbiError.from('error FnSelectorNotRecognized()'))
  )
    return new FunctionSelectorNotRecognizedError() as never

  let matched: Call | null = null
  for (const c of parameters.calls) {
    const call = c as Call
    if (!call.abi) continue
    try {
      const matches = Boolean(
        decodeErrorResult({
          abi: call.abi,
          data: error.data!,
        }),
      )
      if (!matches) continue
      matched = call
    } catch {}
  }
  if (matched)
    return getContractError(error as BaseError, {
      abi: matched.abi as Abi,
      address: matched.to,
      args: matched.args,
      functionName: matched.functionName,
    })

  return e as never
}
