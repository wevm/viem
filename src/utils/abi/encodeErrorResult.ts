import { Abi, ExtractAbiErrorNames } from 'abitype'
import {
  AbiErrorInputsNotFoundError,
  AbiErrorNotFoundError,
} from '../../errors'

import { ExtractErrorArgsFromAbi, Hex } from '../../types'
import { concatHex } from '../data'
import { getFunctionSignature } from '../hash'
import { encodeAbi } from './encodeAbi'
import { formatAbiItemWithParams } from './formatAbiItemWithParams'
import { getAbiItem } from './getAbiItem'

const docsPath = '/docs/contract/encodeErrorResult'

export type EncodeErrorResultArgs<
  TAbi extends Abi = Abi,
  TErrorName extends ExtractAbiErrorNames<TAbi> = any,
> = {
  abi: TAbi
  errorName: TErrorName
} & ExtractErrorArgsFromAbi<TAbi, TErrorName>

export function encodeErrorResult<
  TAbi extends Abi = Abi,
  TErrorName extends ExtractAbiErrorNames<TAbi> = any,
>({ abi, errorName, args }: EncodeErrorResultArgs<TAbi, TErrorName>) {
  const description = getAbiItem({ abi, name: errorName })
  if (!description) throw new AbiErrorNotFoundError(errorName, { docsPath })
  const definition = formatAbiItemWithParams(description)
  const signature = getFunctionSignature(definition)

  let data: Hex = '0x'
  if (args && args.length > 0) {
    if (!('inputs' in description && description.inputs))
      throw new AbiErrorInputsNotFoundError(errorName, { docsPath })
    data = encodeAbi({ params: description.inputs, values: args as any })
  }
  return concatHex([signature, data])
}
