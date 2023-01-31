import { Abi, ExtractAbiFunctionNames } from 'abitype'
import {
  AbiFunctionNotFoundError,
  AbiFunctionOutputsNotFoundError,
} from '../../errors'

import { Hex } from '../../types'
import { decodeAbi } from './decodeAbi'

const docsPath = '/docs/contract/decodeFunctionResult'

export function decodeFunctionResult<
  TAbi extends Abi = Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi> = any,
>({
  abi,
  functionName,
  data,
}: { abi: TAbi; functionName: TFunctionName; data: Hex }) {
  const description = abi.find((x) => 'name' in x && x.name === functionName)
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, { docsPath })
  if (!('outputs' in description))
    throw new AbiFunctionOutputsNotFoundError(functionName, { docsPath })
  const values = decodeAbi({ data, params: description.outputs })
  if (values && values.length > 1) return values
  if (values && values.length === 1) return values[0]
  return undefined
}
