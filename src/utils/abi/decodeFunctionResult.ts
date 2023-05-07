import type { Abi, ExtractAbiFunctionNames, Narrow } from 'abitype'

import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors/abi.js'
import type {
  AbiItem,
  ContractFunctionResult,
  GetFunctionArgs,
  InferFunctionName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'

import { decodeAbiParameters } from './decodeAbiParameters.js'
import { type GetAbiItemParameters, getAbiItem } from './getAbiItem.js'

const docsPath = '/docs/contract/decodeFunctionResult'

export type DecodeFunctionResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string | undefined = string,
  _FunctionName = InferFunctionName<TAbi, TFunctionName>,
> = {
  functionName?: _FunctionName
  data: Hex
} & (TFunctionName extends string
  ? { abi: Narrow<TAbi> } & Partial<GetFunctionArgs<TAbi, TFunctionName>>
  : _FunctionName extends string
  ? { abi: [Narrow<TAbi[number]>] } & Partial<
      GetFunctionArgs<TAbi, _FunctionName>
    >
  : never)

export type DecodeFunctionResultReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string | undefined = string,
  _FunctionName extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiFunctionNames<TAbi>[number]
    : string,
> = TFunctionName extends string
  ? ContractFunctionResult<TAbi, TFunctionName>
  : ContractFunctionResult<TAbi, _FunctionName>

export function decodeFunctionResult<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string | undefined = undefined,
>({
  abi,
  args,
  functionName,
  data,
}: DecodeFunctionResultParameters<
  TAbi,
  TFunctionName
>): DecodeFunctionResultReturnType<TAbi, TFunctionName> {
  let abiItem = abi[0] as AbiItem
  if (functionName) {
    abiItem = getAbiItem({
      abi,
      args,
      name: functionName,
    } as GetAbiItemParameters)
    if (!abiItem) throw new AbiFunctionNotFoundError(functionName, { docsPath })
  }

  if (abiItem.type !== 'function')
    throw new AbiFunctionNotFoundError(undefined, { docsPath })
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath })

  const values = decodeAbiParameters(abiItem.outputs, data)
  if (values && values.length > 1) return values as any
  if (values && values.length === 1) return values[0] as any
  return undefined as any
}
