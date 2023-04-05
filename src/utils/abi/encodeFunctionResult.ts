import type { Abi, Narrow } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors/index.js'

import type {
  InferFunctionName,
  ContractFunctionResult,
} from '../../types/index.js'
import { encodeAbiParameters } from './encodeAbiParameters.js'

const docsPath = '/docs/contract/encodeFunctionResult'

export type EncodeFunctionResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  abi: Narrow<TAbi>
  functionName: InferFunctionName<TAbi, TFunctionName>
  result?: ContractFunctionResult<TAbi, TFunctionName>
}

export function encodeFunctionResult<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>({
  abi,
  functionName,
  result,
}: EncodeFunctionResultParameters<TAbi, TFunctionName>) {
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
