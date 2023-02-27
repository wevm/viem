import { Abi, ExtractAbiFunctionNames, Narrow } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors'

import { ExtractFunctionNameFromAbi, ExtractResultFromAbi } from '../../types'
import { encodeAbiParameters } from './encodeAbiParameters'

const docsPath = '/docs/contract/encodeFunctionResult'

export type EncodeFunctionResultArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  abi: Narrow<TAbi>
  functionName: ExtractFunctionNameFromAbi<TAbi, TFunctionName>
  result?: ExtractResultFromAbi<TAbi, TFunctionName>
}

export function encodeFunctionResult<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>({
  abi,
  functionName,
  result,
}: EncodeFunctionResultArgs<TAbi, TFunctionName>) {
  const description = (abi as Abi).find(
    (x) => 'name' in x && x.name === functionName,
  )
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, { docsPath })
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName, { docsPath })

  let values = Array.isArray(result) ? result : [result]
  if (description.outputs.length === 0 && !values[0]) values = []

  return encodeAbiParameters(description.outputs, values)
}
