import type { Abi, Narrow } from 'abitype'
import {
  AbiErrorInputsNotFoundError,
  AbiErrorNotFoundError,
} from '../../errors/index.js'
import type { GetErrorArgs, InferErrorName, Hex } from '../../types/index.js'
import { concatHex } from '../data/index.js'
import { getFunctionSelector } from '../hash/index.js'
import { encodeAbiParameters } from './encodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'
import { getAbiItem } from './getAbiItem.js'
import type { GetAbiItemParameters } from './getAbiItem.js'

const docsPath = '/docs/contract/encodeErrorResult'

export type EncodeErrorResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TErrorName extends string = string,
> = {
  abi: Narrow<TAbi>
  errorName: InferErrorName<TAbi, TErrorName>
} & GetErrorArgs<TAbi, TErrorName>

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
  if (args && (args as readonly unknown[]).length > 0) {
    if (!('inputs' in description && description.inputs))
      throw new AbiErrorInputsNotFoundError(errorName, { docsPath })
    data = encodeAbiParameters(description.inputs, args as readonly unknown[])
  }
  return concatHex([signature, data])
}
