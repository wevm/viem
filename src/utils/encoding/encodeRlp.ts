import type { ByteArray, Hex } from '../../types'
import { concat } from '../data'
import { encodeBytes } from './encodeBytes'
import { bytesToHex } from './encodeHex'

export type RecursiveArray<T> = T | Array<RecursiveArray<T>>

type To = 'hex' | 'bytes'

export type EncodeRlpResponse<TTo extends To> = TTo extends 'bytes'
  ? ByteArray
  : TTo extends 'hex'
  ? Hex
  : never

export function encodeRlp<TTo extends To = 'hex'>(
  hexOrBytes: RecursiveArray<Hex> | RecursiveArray<ByteArray>,
  to_?: TTo,
) {
  const to = to_ || ('hex' as const)
  return format(bytesToRlp(parse(hexOrBytes)), to) as EncodeRlpResponse<TTo>
}

function parse(
  hexOrBytes: RecursiveArray<Hex> | RecursiveArray<ByteArray>,
): RecursiveArray<ByteArray> {
  if (Array.isArray(hexOrBytes)) return hexOrBytes.map(parse)
  return typeof hexOrBytes === 'string' ? encodeBytes(hexOrBytes) : hexOrBytes
}

function format(bytes: ByteArray, type: 'hex' | 'bytes' = 'bytes') {
  return type === 'hex' ? bytesToHex(bytes) : bytes
}

export function bytesToRlp(bytes: RecursiveArray<ByteArray>): ByteArray {
  if (Array.isArray(bytes)) {
    const encoded = concat(bytes.map(bytesToRlp))
    return new Uint8Array([...encodeLength(encoded.length, 0xc0), ...encoded])
  }

  if (bytes.length === 1 && bytes[0] < 0x80) return bytes
  return new Uint8Array([...encodeLength(bytes.length, 0x80), ...bytes])
}

function encodeLength(length: number, offset: number) {
  if (length < 56) return [offset + length]
  return [encodeBytes(length).length + offset + 55, ...encodeBytes(length)]
}
