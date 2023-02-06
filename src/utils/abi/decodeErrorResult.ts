import { Abi } from 'abitype'
import { AbiErrorSignatureNotFoundError } from '../../errors'
import { Hex } from '../../types'
import { slice } from '../data'
import { getFunctionSignature } from '../hash'
import { decodeAbi } from './decodeAbi'
import { formatAbiItem } from './formatAbiItem'

export type DecodeErrorResultArgs = { abi: Abi; data: Hex }

export function decodeErrorResult({ abi, data }: DecodeErrorResultArgs) {
  const signature = slice(data, 0, 4)
  const description = abi.find(
    (x) => signature === getFunctionSignature(formatAbiItem(x)),
  )
  if (!description)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeErrorResult',
    })
  return {
    errorName: (description as { name: string }).name,
    args: ('inputs' in description &&
    description.inputs &&
    description.inputs.length > 0
      ? decodeAbi({ data: slice(data, 4), params: description.inputs })
      : undefined) as readonly unknown[] | undefined,
  }
}
