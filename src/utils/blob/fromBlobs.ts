import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type FromBlobsParameters<
  blobs extends readonly Hex[] | readonly ByteArray[] =
    | readonly Hex[]
    | readonly ByteArray[],
  to extends To | undefined = undefined,
> = {
  /** Blobs to transform to data. */
  blobs: blobs | readonly Hex[] | readonly ByteArray[]
  to?: to | To | undefined
}

export type FromBlobsReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type FromBlobsErrorType =
  | BytesToHexErrorType
  | HexToBytesErrorType
  | ErrorType

export function fromBlobs<
  const blobs extends readonly Hex[] | readonly ByteArray[],
  to extends To =
    | (blobs extends readonly Hex[] ? 'hex' : never)
    | (blobs extends readonly ByteArray[] ? 'bytes' : never),
>(parameters: FromBlobsParameters<blobs, to>): FromBlobsReturnType<to> {
  const to =
    parameters.to ?? (typeof parameters.blobs[0] === 'string' ? 'hex' : 'bytes')
  const blobs = (
    typeof parameters.blobs[0] === 'string'
      ? parameters.blobs.map((x) => hexToBytes(x as Hex))
      : parameters.blobs
  ) as ByteArray[]

  const length = blobs.reduce((length, blob) => length + blob.length, 0)
  const data = new Uint8Array(length)
  let size = 0

  for (const [index, blob] of blobs.entries()) {
    // Only the final blob contains a terminator: its last 0x80 byte. Preceding blobs contain only data.
    const end = (() => {
      if (index !== blobs.length - 1) return blob.length
      const terminator = blob.lastIndexOf(0x80)
      // A 0x80 in a field's first byte is not data, so no data byte terminates.
      if (terminator === -1 || terminator % 32 === 0) return blob.length
      return terminator
    })()
    // Each 32-byte field starts with a zero byte, followed by 31 bytes of data.
    for (let position = 0; position < end; position += 32) {
      const chunk = blob.subarray(position + 1, Math.min(position + 32, end))
      data.set(chunk, size)
      size += chunk.length
    }
  }

  const trimmedData = data.slice(0, size)
  return (
    to === 'hex' ? bytesToHex(trimmedData) : trimmedData
  ) as FromBlobsReturnType<to>
}
