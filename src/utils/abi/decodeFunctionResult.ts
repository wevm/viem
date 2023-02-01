import { Abi, ExtractAbiFunctionNames } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors'

import {
  ExtractFunctionNameFromAbi,
  ExtractResultFromAbi,
  Hex,
} from '../../types'
import { decodeAbi } from './decodeAbi'

const docsPath = '/docs/contract/decodeFunctionResult'

export type DecodeFunctionResultArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = {
  abi: TAbi
  functionName: ExtractFunctionNameFromAbi<TAbi, TFunctionName>
  data: Hex
}

export type DecodeFunctionResultResponse<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = ExtractResultFromAbi<TAbi, TFunctionName>

export function decodeFunctionResult<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
>({
  abi,
  functionName,
  data,
}: DecodeFunctionResultArgs<TAbi, TFunctionName>): DecodeFunctionResultResponse<
  TAbi,
  TFunctionName
> {
  const description = (abi as Abi).find(
    (x) => 'name' in x && x.name === functionName,
  )
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, { docsPath })
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName, { docsPath })

  const values = decodeAbi({ data, params: description.outputs })
  if (values && values.length > 1) return values as any
  if (values && values.length === 1) return values[0] as any
  return undefined as any
}
