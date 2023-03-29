import type { Abi, Narrow } from 'abitype'

import { AbiFunctionNotFoundError } from '../../errors'
import type { GetFunctionArgs, InferFunctionName } from '../../types'
import { concatHex } from '../data'
import { getFunctionSelector } from '../hash'
import { encodeAbiParameters } from './encodeAbiParameters'
import { formatAbiItem } from './formatAbiItem'
import { getAbiItem, GetAbiItemParameters } from './getAbiItem'

export type EncodeFunctionDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  abi: Narrow<TAbi>
  functionName: InferFunctionName<TAbi, TFunctionName>
} & GetFunctionArgs<TAbi, TFunctionName>

export function encodeFunctionData<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>({
  abi,
  args,
  functionName,
}: EncodeFunctionDataParameters<TAbi, TFunctionName>) {
  const description = getAbiItem({
    abi,
    args,
    name: functionName,
  } as GetAbiItemParameters)
  if (!description)
    throw new AbiFunctionNotFoundError(functionName, {
      docsPath: '/docs/contract/encodeFunctionData',
    })
  const definition = formatAbiItem(description)
  const signature = getFunctionSelector(definition)
  const data =
    'inputs' in description && description.inputs
      ? encodeAbiParameters(
          description.inputs,
          (args ?? []) as readonly unknown[],
        )
      : undefined
  return concatHex([signature, data ?? '0x'])
}
