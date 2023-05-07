import type {
  Abi,
  ExtractAbiError,
  ExtractAbiErrorNames,
  Narrow,
} from 'abitype'

import { solidityError, solidityPanic } from '../../constants/solidity.js'
import {
  AbiDecodingZeroDataError,
  AbiErrorSignatureNotFoundError,
} from '../../errors/abi.js'
import type { AbiItem, GetErrorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { slice } from '../data/slice.js'
import { getFunctionSelector } from '../hash/getFunctionSelector.js'

import { decodeAbiParameters } from './decodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'

export type DecodeErrorResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
> = { abi?: Narrow<TAbi>; data: Hex }

export type DecodeErrorResultReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  _ErrorNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiErrorNames<TAbi>
    : string,
> = {
  [TName in _ErrorNames]: {
    abiItem: TAbi extends Abi ? ExtractAbiError<TAbi, TName> : AbiItem
    args: GetErrorArgs<TAbi, TName>['args']
    errorName: TName
  }
}[_ErrorNames]

export function decodeErrorResult<TAbi extends Abi | readonly unknown[]>({
  abi,
  data,
}: DecodeErrorResultParameters<TAbi>): DecodeErrorResultReturnType<TAbi> {
  const signature = slice(data, 0, 4)
  if (signature === '0x') throw new AbiDecodingZeroDataError()

  const abi_ = [...((abi as Abi) || []), solidityError, solidityPanic]
  const abiItem = abi_.find(
    (x) =>
      x.type === 'error' && signature === getFunctionSelector(formatAbiItem(x)),
  )
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeErrorResult',
    })
  return {
    abiItem,
    args: ('inputs' in abiItem && abiItem.inputs && abiItem.inputs.length > 0
      ? decodeAbiParameters(abiItem.inputs, slice(data, 4))
      : undefined) as readonly unknown[] | undefined,
    errorName: (abiItem as { name: string }).name,
  } as DecodeErrorResultReturnType<TAbi>
}
