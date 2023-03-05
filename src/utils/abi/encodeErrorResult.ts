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
import { getFunctionSelector } from '../hash'
import { encodeAbiParameters } from './encodeAbiParameters'
import { formatAbiItem } from './formatAbiItem'
import { getAbiItem, GetAbiItemParameters } from './getAbiItem'

const docsPath = '/docs/contract/encodeErrorResult'

export type EncodeErrorResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TErrorName extends string = string,
> = {
  abi: Narrow<TAbi>
  errorName: ExtractErrorNameFromAbi<TAbi, TErrorName>
} & ExtractErrorArgsFromAbi<TAbi, TErrorName>

export function encodeErrorResult<
  TAbi extends Abi | readonly unknown[],
  TErrorName extends string,
>({ abi, errorName, args }: EncodeErrorResultParameters<TAbi, TErrorName>) {
  const description = getAbiItem({
    abi,
    args,
    name: errorName,
  } as GetAbiItemParameters)
  if (!description) throw new AbiErrorNotFoundError(errorName, { docsPath })
  const definition = formatAbiItem(description)
  const signature = getFunctionSelector(definition)

  let data: Hex = '0x'
  if (args && args.length > 0) {
    if (!('inputs' in description && description.inputs))
      throw new AbiErrorInputsNotFoundError(errorName, { docsPath })
    data = encodeAbiParameters(description.inputs, args as readonly unknown[])
  }
  return concatHex([signature, data])
}
