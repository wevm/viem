import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type CreateCursorErrorType, createCursor } from '../cursor.js'
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
  | CreateCursorErrorType
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
  const data = createCursor(new Uint8Array(length))
  let active = true

  for (const blob of blobs) {
    const cursor = createCursor(blob)
    while (active && cursor.position < blob.length) {
      // First byte will be a zero 0x00 byte – we can skip.
      cursor.incrementPosition(1)

      let consume = 31
      if (blob.length - cursor.position < 31)
        consume = blob.length - cursor.position
      const bytes = cursor.readBytes(consume)

      for (const byte of bytes) {
        if (byte === 0x80) {
          active = false
          break
        }
        data.pushByte(byte)
      }
    }
  }

  const trimmedData = data.bytes.slice(0, data.position)
  return (
    to === 'hex' ? bytesToHex(trimmedData) : trimmedData
  ) as FromBlobsReturnType<to>
}
