import { keccak_256 } from '@noble/hashes/sha3'

import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type ToHexErrorType, toHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type Keccak256Hash<TTo extends To> =
  | (TTo extends 'bytes' ? ByteArray : never)
  | (TTo extends 'hex' ? Hex : never)

export type Keccak256ErrorType =
  | IsHexErrorType
  | ToBytesErrorType
  | ToHexErrorType
  | ErrorType

export function keccak256<TTo extends To = 'hex'>(
  value: Hex | ByteArray,
  to_?: TTo | undefined,
): Keccak256Hash<TTo> {
  const to = to_ || 'hex'
  const bytes = keccak_256(
    isHex(value, { strict: false }) ? toBytes(value) : value,
  )
  if (to === 'bytes') return bytes as Keccak256Hash<TTo>
  return toHex(bytes) as Keccak256Hash<TTo>
}
