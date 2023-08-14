import type { Abi, Narrow } from 'abitype'

import { AbiFunctionNotFoundError } from '../../errors/abi.js'
import type {
  AbiItem,
  GetFunctionArgs,
  InferFunctionName,
} from '../../types/contract.js'
import { concatHex } from '../data/concat.js'
import { getFunctionSelector } from '../hash/getFunctionSelector.js'

import { encodeAbiParameters } from './encodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'
import { type GetAbiItemParameters, getAbiItem } from './getAbiItem.js'

export type EncodeFunctionDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string | undefined = string,
  _FunctionName = InferFunctionName<TAbi, TFunctionName>,
> = {
  functionName?: _FunctionName
} & (TFunctionName extends string
  ? { abi: Narrow<TAbi> } & GetFunctionArgs<TAbi, TFunctionName>
  : _FunctionName extends string
  ? { abi: [Narrow<TAbi[number]>] } & GetFunctionArgs<TAbi, _FunctionName>
  : never)

export function encodeFunctionData<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string | undefined = undefined,
>({
  abi,
  args,
  functionName,
}: EncodeFunctionDataParameters<TAbi, TFunctionName>) {
  let abiItem = abi[0] as AbiItem
  if (functionName) {
    abiItem = getAbiItem({
      abi,
      args,
      name: functionName,
    } as GetAbiItemParameters)
    if (!abiItem)
      throw new AbiFunctionNotFoundError(functionName, {
        docsPath: '/docs/contract/encodeFunctionData',
      })
  }

  if (abiItem.type !== 'function')
    throw new AbiFunctionNotFoundError(undefined, {
      docsPath: '/docs/contract/encodeFunctionData',
    })

  const definition = formatAbiItem(abiItem)
  const signature = getFunctionSelector(definition)
  const data =
    'inputs' in abiItem && abiItem.inputs
      ? encodeAbiParameters(abiItem.inputs, (args ?? []) as readonly unknown[])
      : undefined
  return concatHex([signature, data ?? '0x'])
}
