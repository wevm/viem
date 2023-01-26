import { Abi, ExtractAbiFunctionNames } from 'abitype'

import { ExtractArgsFromAbi } from '../../types'
import { BaseError } from '../BaseError'
import { concatHex } from '../data'
import { getFunctionSignature } from '../hash'
import { encodeAbi } from './encodeAbi'
import { getDefinition } from './getDefinition'

export function encodeFunctionParams<
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
  if (!description) throw new AbiFunctionNotFoundError(functionName)
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

class AbiFunctionNotFoundError extends BaseError {
  constructor(functionName: string) {
    super(
      [
        `Function "${functionName}" not found on ABI.`,
        'Make sure you are using the correct ABI and that the function exists on it.',
      ].join('\n'),
      {
        docsPath: '/docs/contract/encodeFunctionParams',
      },
    )
  }
}
