import { Abi, AbiError } from 'abitype'
import {
  AbiDecodingZeroDataError,
  AbiErrorSignatureNotFoundError,
} from '../../errors'
import { Hex } from '../../types'
import { slice } from '../data'
import { getFunctionSignature } from '../hash'
import { decodeAbi } from './decodeAbi'
import { formatAbiItem } from './formatAbiItem'

const solidityError: AbiError = {
  inputs: [
    {
      internalType: 'string',
      name: 'message',
      type: 'string',
    },
  ],
  name: 'Error',
  type: 'error',
}
const solidityPanic: AbiError = {
  inputs: [
    {
      internalType: 'uint256',
      name: 'reason',
      type: 'uint256',
    },
  ],
  name: 'Panic',
  type: 'error',
}

export type DecodeErrorResultArgs = { abi?: Abi; data: Hex }

export type DecodeErrorResultResponse = {
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
  const description = abi_.find(
    (x) =>
      x.type === 'error' &&
      signature === getFunctionSignature(formatAbiItem(x)),
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
