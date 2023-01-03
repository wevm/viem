import type { Hex } from '../../types'

type DecodeHexResponse<TTo> = TTo extends 'string'
  ? string
  : TTo extends 'bigint'
  ? bigint
  : TTo extends 'number'
  ? number
  : TTo extends 'bytes'
  ? Uint8Array
  : never

function assertLength(hex: Hex) {
  if (hex.length % 2) throw new Error('Hex value is unpadded.')
}

/**
 * @description Decodes a hex string into a string, number, bigint, or bytes (Uint8Array).
 */
export function decodeHex<TTo extends 'string' | 'bigint' | 'number' | 'bytes'>(
  hex: Hex,
  to: TTo,
): DecodeHexResponse<TTo> {
  if (to === 'number') return hexToNumber(hex) as DecodeHexResponse<TTo>
  if (to === 'bigint') return hexToBigInt(hex) as DecodeHexResponse<TTo>
  if (to === 'string') return hexToString(hex) as DecodeHexResponse<TTo>
  return hexToBytes(hex) as DecodeHexResponse<TTo>
}

/**
 * @description Decodes a hex string into a number.
 */
export function hexToNumber(hex: Hex): number {
  return Number(BigInt(hex))
}

/**
 * @description Decodes a hex string into a bigint.
 */
export function hexToBigInt(hex: Hex): bigint {
  return BigInt(hex)
}

/**
 * @description Decodes a hex string into bytes (Uint8Array).
 */
export function hexToBytes(hex_: Hex): Uint8Array {
  let hex = hex_.slice(2) as Hex

  assertLength(hex)

  const array = new Uint8Array(hex.length / 2)
  for (let index = 0; index < array.length; index++) {
    const start = index * 2
    const hexByte = hex.slice(start, start + 2)
    const byte = Number.parseInt(hexByte, 16)
    if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence')
    array[index] = byte
  }
  return array
}

/**
 * @description Decodes a hex string into a UTF-8 string.
 */
export function hexToString(hex: Hex): string {
  const bytes = hexToBytes(hex)
  return new TextDecoder().decode(bytes)
}
