import type { Abi } from 'abitype'

import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors/abi.js'
import type {
  AbiItem,
  ContractFunctionResult,
  InferFunctionName,
} from '../../types/contract.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import {
  type GetAbiItemErrorType,
  type GetAbiItemParameters,
  getAbiItem,
} from './getAbiItem.js'

const docsPath = '/docs/contract/encodeFunctionResult'

export type EncodeFunctionResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string | undefined = string,
  _FunctionName = InferFunctionName<TAbi, TFunctionName>,
> = {
  functionName?: _FunctionName
} & (TFunctionName extends string
  ? { abi: TAbi; result?: ContractFunctionResult<TAbi, TFunctionName> }
  : _FunctionName extends string
    ? {
        abi: [TAbi[number]]
        result?: ContractFunctionResult<TAbi, _FunctionName>
      }
    : never)

export type EncodeFunctionResultErrorType =
  | AbiFunctionOutputsNotFoundError
  | AbiFunctionNotFoundError
  | EncodeAbiParametersErrorType
  | GetAbiItemErrorType
  | ErrorType

export function encodeFunctionResult<
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends string | undefined = undefined,
>({
  abi,
  functionName,
  result,
}: EncodeFunctionResultParameters<TAbi, TFunctionName>) {
  let abiItem = abi[0] as AbiItem
  if (functionName) {
    abiItem = getAbiItem({
      abi,
      name: functionName,
    } as GetAbiItemParameters)
    if (!abiItem)
      throw new AbiFunctionNotFoundError(functionName, {
        docsPath: '/docs/contract/encodeFunctionResult',
      })
  }

  if (abiItem.type !== 'function')
    throw new AbiFunctionNotFoundError(undefined, {
      docsPath: '/docs/contract/encodeFunctionResult',
    })

  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath })

  let values = Array.isArray(result) ? result : [result]
  if (abiItem.outputs.length === 0 && !values[0]) values = []

  return encodeAbiParameters(abiItem.outputs, values)
}
