import type { Abi } from 'abitype'
import { solidityError, solidityPanic } from '../../constants'
import {
  AbiDecodingZeroDataError,
  AbiErrorSignatureNotFoundError,
} from '../../errors'
import type { AbiItem, Hex } from '../../types'
import { slice } from '../data'
import { getFunctionSelector } from '../hash'
import { decodeAbiParameters } from './decodeAbiParameters'
import { formatAbiItem } from './formatAbiItem'

export type DecodeErrorResultParameters = { abi?: Abi; data: Hex }

export type DecodeErrorResultReturnType = {
  abiItem: AbiItem
  errorName: string
  args?: readonly unknown[]
}

export function decodeErrorResult({
  abi,
  data,
}: DecodeErrorResultParameters): DecodeErrorResultReturnType {
  const signature = slice(data, 0, 4)
  if (signature === '0x') throw new AbiDecodingZeroDataError()

  const abi_ = [...(abi || []), solidityError, solidityPanic]
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
  }
}
