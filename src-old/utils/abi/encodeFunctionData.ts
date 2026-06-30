import type { Abi, AbiStateMutability, ExtractAbiFunctions } from 'abitype'

import type { AbiFunctionNotFoundErrorType } from '../../errors/abi.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { IsNarrowable, UnionEvaluate } from '../../types/utils.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import type { ToFunctionSelectorErrorType } from '../hash/toFunctionSelector.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import type { FormatAbiItemErrorType } from './formatAbiItem.js'
import type { GetAbiItemErrorType } from './getAbiItem.js'
import { prepareEncodeFunctionData } from './prepareEncodeFunctionData.js'

export type EncodeFunctionDataParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends
    | ContractFunctionName<abi>
    | Hex
    | undefined = ContractFunctionName<abi>,
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
} & UnionEvaluate<
  IsNarrowable<abi, Abi> extends true
    ? abi['length'] extends 1
      ? { functionName?: functionName | allFunctionNames | Hex | undefined }
      : { functionName: functionName | allFunctionNames | Hex }
    : { functionName?: functionName | allFunctionNames | Hex | undefined }
> &
  UnionEvaluate<
    readonly [] extends allArgs
      ? { args?: allArgs | undefined }
      : { args: allArgs }
  > &
  (hasFunctions extends true ? unknown : never)

export type EncodeFunctionDataReturnType = Hex

export type EncodeFunctionDataErrorType =
  | AbiFunctionNotFoundErrorType
  | ConcatHexErrorType
  | EncodeAbiParametersErrorType
  | FormatAbiItemErrorType
  | GetAbiItemErrorType
  | ToFunctionSelectorErrorType
  | ErrorType

export function encodeFunctionData<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
  parameters: EncodeFunctionDataParameters<abi, functionName>,
): EncodeFunctionDataReturnType {
  const { args } = parameters as EncodeFunctionDataParameters

  const { abi, functionName } = (() => {
    if (
      parameters.abi.length === 1 &&
      parameters.functionName?.startsWith('0x')
    )
      return parameters as { abi: Abi; functionName: Hex }
    return prepareEncodeFunctionData(parameters)
  })()

  const abiItem = abi[0]
  const signature = functionName

  const data =
    'inputs' in abiItem && abiItem.inputs
      ? encodeAbiParameters(abiItem.inputs, args ?? [])
      : undefined
  return concatHex([signature, data ?? '0x'])
}
