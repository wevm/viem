import { Abi, ExtractAbiFunctionNames } from 'abitype'

import { AbiFunctionNotFoundError } from '../../errors'
import { ExtractArgsFromAbi } from '../../types'
import { concatHex } from '../data'
import { getFunctionSignature } from '../hash'
import { encodeAbi } from './encodeAbi'
import { getDefinition } from './getDefinition'

export function encodeFunctionData<
  TAbi extends Abi = Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi> = any,
>({
  abi,
  args,
  functionName,
}: { abi: TAbi; functionName: TFunctionName } & ExtractArgsFromAbi<
  TAbi,
  TFunctionName
>) {
  const description = abi.find((x) => 'name' in x && x.name === functionName)
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, {
      docsPath: '/docs/contract/encodeFunctionData',
    })
  const definition = getDefinition(description)
  const signature = getFunctionSignature(definition)
  const data =
    'inputs' in description && description.inputs
      ? encodeAbi({
          params: description.inputs,
          values: (args ?? []) as any,
        })
      : undefined
  return concatHex([signature, data ?? '0x'])
}
