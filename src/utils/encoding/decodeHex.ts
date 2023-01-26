import type { ByteArray, Hex } from '../../types'
import { BaseError } from '../BaseError'
import { trim } from '../data'
import { hexToBytes } from './encodeBytes'

type DecodeHexResponse<TTo> = TTo extends 'string'
  ? string
  : TTo extends 'bigint'
  ? bigint
  : TTo extends 'number'
  ? number
  : TTo extends 'bytes'
  ? ByteArray
  : TTo extends 'boolean'
  ? boolean
  : never

/**
 * @description Decodes a hex string into a string, number, bigint, boolean, or bytes32 array.
 */
export function decodeHex<
  TTo extends 'string' | 'bigint' | 'number' | 'bytes' | 'boolean',
>(hex: Hex, to: TTo): DecodeHexResponse<TTo> {
  if (to === 'number') return hexToNumber(hex) as DecodeHexResponse<TTo>
  if (to === 'bigint') return hexToBigInt(hex) as DecodeHexResponse<TTo>
  if (to === 'string') return hexToString(hex) as DecodeHexResponse<TTo>
  if (to === 'boolean') return hexToBool(hex) as DecodeHexResponse<TTo>
  return hexToBytes(hex) as DecodeHexResponse<TTo>
}

export type HexToBigIntOpts = {
  // Whether or not the number of a signed representation.
  signed?: boolean
}

/**
 * @description Decodes a hex string into a bigint.
 */
export function hexToBigInt(hex: Hex, opts: HexToBigIntOpts = {}): bigint {
  const { signed } = opts

  const value = BigInt(hex)
  if (!signed) return value

  const size = (hex.length - 2) / 2
  const max = (1n << (BigInt(size) * 8n - 1n)) - 1n
  if (value <= max) return value

  return value - BigInt(`0x${'f'.padStart(size * 2, 'f')}`) - 1n
}

/**
 * @description Decodes a hex string into a boolean.
 */
export function hexToBool(hex: Hex): boolean {
  if (trim(hex) === '0x0') return false
  if (trim(hex) === '0x1') return true
  throw new InvalidHexBooleanError(hex)
}

type NumberToHexOpts = HexToBigIntOpts

/**
 * @description Decodes a hex string into a number.
 */
export function hexToNumber(hex: Hex, opts: NumberToHexOpts = {}): number {
  return Number(hexToBigInt(hex, opts))
}

/**
 * @description Decodes a hex string into a UTF-8 string.
 */
export function hexToString(hex: Hex): string {
  const bytes = hexToBytes(hex)
  return new TextDecoder().decode(bytes)
}

////////////////////////////////////////////////////////////
// Errors

class InvalidHexBooleanError extends BaseError {
  name = 'InvalidHexBooleanError'
  constructor(hex: Hex) {
    super(
      `Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`,
    )
  }
}
