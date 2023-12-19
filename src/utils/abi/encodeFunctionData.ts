import type { Abi } from 'abitype'

import {
  AbiFunctionNotFoundError,
  type AbiFunctionNotFoundErrorType,
} from '../../errors/abi.js'
import type {
  AbiItem,
  GetFunctionArgs,
  InferFunctionName,
} from '../../types/contract.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import {
  type GetFunctionSelectorErrorType,
  getFunctionSelector,
} from '../hash/getFunctionSelector.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'
import {
  type GetAbiItemErrorType,
  type GetAbiItemParameters,
  getAbiItem,
} from './getAbiItem.js'

export type EncodeFunctionDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string | undefined = string,
  _FunctionName = InferFunctionName<TAbi, TFunctionName>,
> = {
  functionName?: _FunctionName
} & (TFunctionName extends string
  ? { abi: TAbi } & GetFunctionArgs<TAbi, TFunctionName>
  : _FunctionName extends string
    ? { abi: [TAbi[number]] } & GetFunctionArgs<TAbi, _FunctionName>
    : never)

export type EncodeFunctionDataErrorType =
  | AbiFunctionNotFoundErrorType
  | ConcatHexErrorType
  | EncodeAbiParametersErrorType
  | FormatAbiItemErrorType
  | GetAbiItemErrorType
  | GetFunctionSelectorErrorType
  | ErrorType

export function encodeFunctionData<
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends string | undefined = undefined,
>({
  abi,
  args,
  functionName,
}: EncodeFunctionDataParameters<TAbi, TFunctionName>) {
  let abiItem = abi[0] as AbiItem
  if (functionName) {
    abiItem = getAbiItem({
      abi,
      args,
      name: functionName,
    } as GetAbiItemParameters)
    if (!abiItem)
      throw new AbiFunctionNotFoundError(functionName, {
        docsPath: '/docs/contract/encodeFunctionData',
      })
  }

  if (abiItem.type !== 'function')
    throw new AbiFunctionNotFoundError(undefined, {
      docsPath: '/docs/contract/encodeFunctionData',
    })

  const definition = formatAbiItem(abiItem)
  const signature = getFunctionSelector(definition)
  const data =
    'inputs' in abiItem && abiItem.inputs
      ? encodeAbiParameters(abiItem.inputs, (args ?? []) as readonly unknown[])
      : undefined
  return concatHex([signature, data ?? '0x'])
}
