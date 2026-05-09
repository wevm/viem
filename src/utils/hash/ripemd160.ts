import { ripemd160 as noble_ripemd160 } from '@noble/hashes/ripemd160'

import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type ToHexErrorType, toHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type Ripemd160Hash<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type Ripemd160ErrorType =
  | IsHexErrorType
  | ToBytesErrorType
  | ToHexErrorType
  | ErrorType

export function ripemd160<to extends To = 'hex'>(
  value: Hex | ByteArray,
  to_?: to | undefined,
): Ripemd160Hash<to> {
  const to = to_ || 'hex'
  const bytes = noble_ripemd160(
    isHex(value, { strict: false }) ? toBytes(value) : value,
  )
  if (to === 'bytes') return bytes as Ripemd160Hash<to>
  return toHex(bytes) as Ripemd160Hash<to>
}
