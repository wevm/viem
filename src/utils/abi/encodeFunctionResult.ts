import { Abi, ExtractAbiFunctionNames } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors'

import { ExtractResultFromAbi } from '../../types'
import { encodeAbi } from './encodeAbi'

const docsPath = '/docs/contract/encodeFunctionResult'

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
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, { docsPath })
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName, { docsPath })

  let values = Array.isArray(result) ? result : [result]
  if (description.outputs.length === 0 && !values[0]) values = []

  return encodeAbi({ params: description.outputs, values })
}
