import type { Abi, AbiStateMutability, ExtractAbiFunctions } from 'abitype'

import {
  AbiFunctionNotFoundError,
  type AbiFunctionNotFoundErrorType,
  AbiFunctionOutputsNotFoundError,
  type AbiFunctionOutputsNotFoundErrorType,
} from '../../errors/abi.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionReturnType,
  Widen,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'

import type { ErrorType } from '../../errors/utils.js'
import type { IsNarrowable, UnionEvaluate } from '../../types/utils.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from './decodeAbiParameters.js'
import { type GetAbiItemErrorType, getAbiItem } from './getAbiItem.js'

const docsPath = '/docs/contract/decodeFunctionResult'

export type DecodeFunctionResultParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends
    | ContractFunctionName<abi>
    | undefined = ContractFunctionName<abi>,
  args extends ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  > = ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  >,
  ///
  hasFunctions = abi extends Abi
    ? Abi extends abi
      ? true
      : [ExtractAbiFunctions<abi>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  >,
  allFunctionNames = ContractFunctionName<abi>,
> = {
  abi: abi
  data: Hex
} & UnionEvaluate<
  IsNarrowable<abi, Abi> extends true
    ? abi['length'] extends 1
      ? { functionName?: functionName | allFunctionNames }
      : { functionName: functionName | allFunctionNames }
    : { functionName?: functionName | allFunctionNames }
> &
  UnionEvaluate<
    readonly [] extends allArgs
      ? {
          args?:
            | allArgs // show all options
            // infer value, widen inferred value of `args` conditionally to match `allArgs`
            | (abi extends Abi
                ? args extends allArgs
                  ? Widen<args>
                  : never
                : never)
            | undefined
        }
      : {
          args?:
            | allArgs // show all options
            | (Widen<args> & (args extends allArgs ? unknown : never)) // infer value, widen inferred value of `args` match `allArgs` (e.g. avoid union `args: readonly [123n] | readonly [bigint]`)
            | undefined
        }
  > &
  (hasFunctions extends true ? unknown : never)

export type DecodeFunctionResultReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends
    | ContractFunctionName<abi>
    | undefined = ContractFunctionName<abi>,
  args extends ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  > = ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  >,
> = ContractFunctionReturnType<
  abi,
  AbiStateMutability,
  functionName extends ContractFunctionName<abi>
    ? functionName
    : ContractFunctionName<abi>,
  args
>

export type DecodeFunctionResultErrorType =
  | AbiFunctionNotFoundErrorType
  | AbiFunctionOutputsNotFoundErrorType
  | DecodeAbiParametersErrorType
  | GetAbiItemErrorType
  | ErrorType

export function decodeFunctionResult<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
  args extends ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  > = ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName extends ContractFunctionName<abi>
      ? functionName
      : ContractFunctionName<abi>
  >,
>(
  parameters: DecodeFunctionResultParameters<abi, functionName, args>,
): DecodeFunctionResultReturnType<abi, functionName, args> {
  const { abi, args, functionName, data } =
    parameters as DecodeFunctionResultParameters

  let abiItem = abi[0]
  if (functionName) {
    const item = getAbiItem({ abi, args, name: functionName })
    if (!item) throw new AbiFunctionNotFoundError(functionName, { docsPath })
    abiItem = item
  }

  if (abiItem.type !== 'function')
    throw new AbiFunctionNotFoundError(undefined, { docsPath })
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath })

  const values = decodeAbiParameters(abiItem.outputs, data)
  if (values && values.length > 1)
    return values as DecodeFunctionResultReturnType<abi, functionName, args>
  if (values && values.length === 1)
    return values[0] as DecodeFunctionResultReturnType<abi, functionName, args>
  return undefined as DecodeFunctionResultReturnType<abi, functionName, args>
}
