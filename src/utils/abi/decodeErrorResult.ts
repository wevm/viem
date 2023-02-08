import { Abi, AbiError } from 'abitype'
import { solidityError, solidityPanic } from '../../constants'
import {
  AbiDecodingZeroDataError,
  AbiErrorSignatureNotFoundError,
} from '../../errors'
import { AbiItem, Hex } from '../../types'
import { slice } from '../data'
import { getFunctionSignature } from '../hash'
import { decodeAbi } from './decodeAbi'
import { formatAbiItem } from './formatAbiItem'

export type DecodeErrorResultArgs = { abi?: Abi; data: Hex }

export type DecodeErrorResultResponse = {
  abiItem: AbiItem
  errorName: string
  args?: readonly unknown[]
}

export function decodeErrorResult({
  abi,
  data,
}: DecodeErrorResultArgs): DecodeErrorResultResponse {
  const signature = slice(data, 0, 4)
  if (signature === '0x') throw new AbiDecodingZeroDataError()

  const abi_ = [...(abi || []), solidityError, solidityPanic]
  const abiItem = abi_.find(
    (x) =>
      x.type === 'error' &&
      signature === getFunctionSignature(formatAbiItem(x)),
  )
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeErrorResult',
    })
  return {
    abiItem,
    args: ('inputs' in abiItem && abiItem.inputs && abiItem.inputs.length > 0
      ? decodeAbi({ data: slice(data, 4), params: abiItem.inputs })
      : undefined) as readonly unknown[] | undefined,
    errorName: (abiItem as { name: string }).name,
  }
}
