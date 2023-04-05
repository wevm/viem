import { InvalidBytesBooleanError } from '../../errors/index.js'
import type { ByteArray, Hex } from '../../types/index.js'
import { hexToBigInt, hexToNumber } from './fromHex.js'
import { bytesToHex } from './toHex.js'

type FromBytesReturnType<TTo> = TTo extends 'string'
  ? string
  : TTo extends 'hex'
  ? Hex
  : TTo extends 'bigint'
  ? bigint
  : TTo extends 'number'
  ? number
  : TTo extends 'boolean'
  ? boolean
  : never

/**
 * @description Decodes a byte array into a UTF-8 string, hex value, number, bigint or boolean.
 */
export function fromBytes<
  TTo extends 'string' | 'hex' | 'bigint' | 'number' | 'boolean',
>(bytes: ByteArray, to: TTo): FromBytesReturnType<TTo> {
  if (to === 'number') return bytesToNumber(bytes) as FromBytesReturnType<TTo>
  if (to === 'bigint') return bytesToBigint(bytes) as FromBytesReturnType<TTo>
  if (to === 'boolean') return bytesToBool(bytes) as FromBytesReturnType<TTo>
  if (to === 'string') return bytesToString(bytes) as FromBytesReturnType<TTo>
  return bytesToHex(bytes) as FromBytesReturnType<TTo>
}

/**
 * @description Decodes a byte array into a bigint.
 */
export function bytesToBigint(bytes: ByteArray): bigint {
  const hex = bytesToHex(bytes)
  return hexToBigInt(hex)
}

/**
 * @description Decodes a byte array into a boolean.
 */
export function bytesToBool(bytes: ByteArray): boolean {
  if (bytes.length > 1 || bytes[0] > 1)
    throw new InvalidBytesBooleanError(bytes)
  return Boolean(bytes[0])
}

export { bytesToHex }

/**
 * @description Decodes a byte array into a number.
 */
export function bytesToNumber(bytes: ByteArray): number {
  const hex = bytesToHex(bytes)
  return hexToNumber(hex)
}

/**
 * @description Decodes a byte array into a UTF-8 string.
 */
export function bytesToString(bytes: ByteArray): string {
  return new TextDecoder().decode(bytes)
}
