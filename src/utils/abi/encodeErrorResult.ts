import { Abi, Narrow } from 'abitype'
import {
  AbiErrorInputsNotFoundError,
  AbiErrorNotFoundError,
} from '../../errors'
import {
  ExtractErrorArgsFromAbi,
  ExtractErrorNameFromAbi,
  Hex,
} from '../../types'
import { concatHex } from '../data'
import { getFunctionSignature } from '../hash'
import { encodeAbi } from './encodeAbi'
import { formatAbiItem } from './formatAbiItem'
import { getAbiItem, GetAbiItemArgs } from './getAbiItem'

const docsPath = '/docs/contract/encodeErrorResult'

export type EncodeErrorResultArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TErrorName extends string = string,
> = {
  abi: Narrow<TAbi>
  errorName: ExtractErrorNameFromAbi<TAbi, TErrorName>
} & ExtractErrorArgsFromAbi<TAbi, TErrorName>

export function encodeErrorResult<
  TAbi extends Abi | readonly unknown[],
  TErrorName extends string,
>({ abi, errorName, args }: EncodeErrorResultArgs<TAbi, TErrorName>) {
  const description = getAbiItem({
    abi,
    args,
    name: errorName,
  } as GetAbiItemArgs)
  if (!description) throw new AbiErrorNotFoundError(errorName, { docsPath })
  const definition = formatAbiItem(description)
  const signature = getFunctionSignature(definition)

  let data: Hex = '0x'
  if (args && args.length > 0) {
    if (!('inputs' in description && description.inputs))
      throw new AbiErrorInputsNotFoundError(errorName, { docsPath })
    data = encodeAbi({ params: description.inputs, values: args as any })
  }
  return concatHex([signature, data])
}
