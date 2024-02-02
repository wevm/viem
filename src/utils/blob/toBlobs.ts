import {
  bytesPerBlob,
  fieldElementsPerBlob,
  maxBytesPerTransaction,
} from '../../constants/blob.js'
import {
  BlobSizeTooLargeError,
  type BlobSizeTooLargeErrorType,
  EmptyBlobError,
  type EmptyBlobErrorType,
} from '../../errors/blob.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type SizeErrorType, size } from '../data/size.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type ToBlobsParameters<
  data extends Hex | ByteArray = Hex | ByteArray,
  to extends To | undefined = undefined,
> = {
  /** Data to transform to a blob. */
  data: data | Hex | ByteArray
  /** Return type. */
  to?: to | To | undefined
}

export type ToBlobsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray[] : never)
  | (to extends 'hex' ? Hex[] : never)

export type ToBlobsErrorType =
  | BlobSizeTooLargeErrorType
  | BytesToHexErrorType
  | EmptyBlobErrorType
  | HexToBytesErrorType
  | SizeErrorType
  | ErrorType

/**
 * Transforms arbitrary data to blobs.
 *
 * @example
 * ```ts
 * import { toBlobs, stringToHex } from 'viem'
 *
 * const blobs = toBlobs({ data: stringToHex('hello world') })
 * ```
 */
export function toBlobs<
  const data extends Hex | ByteArray,
  to extends To =
    | (data extends Hex ? 'hex' : never)
    | (data extends ByteArray ? 'bytes' : never),
>(parameters: ToBlobsParameters<data, to>): ToBlobsReturnType<to> {
  const to =
    parameters.to ?? (typeof parameters.data === 'string' ? 'hex' : 'bytes')
  const data =
    typeof parameters.data === 'string'
      ? hexToBytes(parameters.data)
      : parameters.data

  const size_ = size(data)
  if (!size_) throw new EmptyBlobError()
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_,
    })

  const length = Math.ceil(size_ / bytesPerBlob)
  const paddedData = pad(data as any, length)

  const blobs: Uint8Array[] = []
  for (let i = 0; i < length; i++) {
    const chunk = paddedData.subarray(i * bytesPerBlob, (i + 1) * bytesPerBlob)
    const blob = toBlob(chunk)
    blobs.push(blob)
  }

  return (
    to === 'bytes' ? blobs : blobs.map((x) => bytesToHex(x))
  ) as ToBlobsReturnType<to>
}

function pad(data_: ByteArray, length: number): ByteArray {
  const data = new Uint8Array(length * bytesPerBlob).fill(0)
  data.set(data_)
  data[data_.byteLength] = 0x80
  return data
}

function toBlob(data: Uint8Array): Uint8Array {
  const blob = new Uint8Array(bytesPerBlob)
  for (let i = 0; i < fieldElementsPerBlob; i++) {
    const chunk = new Uint8Array(32)
    chunk.set(data.subarray(i * 31, (i + 1) * 31), 0)
    blob.set(chunk, i * 32)
  }

  return blob
}
