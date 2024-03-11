import type { Abi, AbiStateMutability, ExtractAbiFunctions } from 'abitype'

import {
  AbiFunctionNotFoundError,
  type AbiFunctionNotFoundErrorType,
} from '../../errors/abi.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../types/contract.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import {
  type ToFunctionSelectorErrorType,
  toFunctionSelector,
} from '../hash/toFunctionSelector.js'

import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import type { IsNarrowable, UnionEvaluate } from '../../types/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'
import { type GetAbiItemErrorType, getAbiItem } from './getAbiItem.js'

const docsPath = '/docs/contract/encodeFunctionData'

export type EncodeFunctionDataParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends
    | ContractFunctionName<abi>
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
      ? { functionName?: functionName | allFunctionNames }
      : { functionName: functionName | allFunctionNames }
    : { functionName?: functionName | allFunctionNames }
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
  const { abi, args, functionName } = parameters as EncodeFunctionDataParameters

  let abiItem = abi[0]
  if (functionName) {
    const item = getAbiItem({
      abi,
      args,
      name: functionName,
    })
    if (!item) throw new AbiFunctionNotFoundError(functionName, { docsPath })
    abiItem = item
  }

  if (abiItem.type !== 'function')
    throw new AbiFunctionNotFoundError(undefined, { docsPath })

  const definition = formatAbiItem(abiItem)
  const signature = toFunctionSelector(definition)
  const data =
    'inputs' in abiItem && abiItem.inputs
      ? encodeAbiParameters(abiItem.inputs, args ?? [])
      : undefined
  return concatHex([signature, data ?? '0x'])
}
