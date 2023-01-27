import { Abi, ExtractAbiFunctionNames } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors'

import { Hex } from '../../types'
import { decodeAbi } from './decodeAbi'

export function decodeFunctionResult<
  TAbi extends Abi = Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi> = any,
>({
  abi,
  functionName,
  data,
}: { abi: TAbi; functionName: TFunctionName; data: Hex }) {
  const description = abi.find((x) => 'name' in x && x.name === functionName)
  if (!description) throw new AbiFunctionNotFoundError(functionName)
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName)
  const values = decodeAbi({ data, params: description.outputs })
  return values.length > 1
    ? values
    : values.length === 1
    ? values[0]
    : undefined
}
