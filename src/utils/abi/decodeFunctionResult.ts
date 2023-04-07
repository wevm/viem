import type { Abi, Narrow } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors/index.js'
import type {
  GetFunctionArgs,
  InferFunctionName,
  ContractFunctionResult,
  Hex,
} from '../../types/index.js'
import { decodeAbiParameters } from './decodeAbiParameters.js'
import { getAbiItem } from './getAbiItem.js'
import type { GetAbiItemParameters } from './getAbiItem.js'

const docsPath = '/docs/contract/decodeFunctionResult'

export type DecodeFunctionResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  abi: Narrow<TAbi>
  functionName: InferFunctionName<TAbi, TFunctionName>
  data: Hex
} & Partial<GetFunctionArgs<TAbi, TFunctionName>>

export type DecodeFunctionResultReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ContractFunctionResult<TAbi, TFunctionName>

export function decodeFunctionResult<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>({
  abi,
  args,
  functionName,
  data,
}: DecodeFunctionResultParameters<
  TAbi,
  TFunctionName
>): DecodeFunctionResultReturnType<TAbi, TFunctionName> {
  const description = getAbiItem({
    abi,
    args,
    name: functionName,
  } as GetAbiItemParameters)
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, { docsPath })
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName, { docsPath })

  const values = decodeAbiParameters(description.outputs, data)
  if (values && values.length > 1) return values as any
  if (values && values.length === 1) return values[0] as any
  return undefined as any
}
