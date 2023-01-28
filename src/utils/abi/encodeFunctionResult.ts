import { Abi, ExtractAbiFunctionNames } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors'

import { ExtractResultFromAbi } from '../../types'
import { encodeAbi } from './encodeAbi'

export function encodeFunctionResult<
  TAbi extends Abi = Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi> = any,
>({
  abi,
  functionName,
  result,
}: { abi: TAbi; functionName: TFunctionName } & ExtractResultFromAbi<
  TAbi,
  TFunctionName
>) {
  const description = abi.find((x) => 'name' in x && x.name === functionName)
  if (!description) throw new AbiFunctionNotFoundError(functionName)
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName)

  let values = Array.isArray(result) ? result : [result]
  if (description.outputs.length === 0 && !values[0]) values = []

  const data = encodeAbi({ params: description.outputs, values })
  if (!data) return '0x'
  return data
}
