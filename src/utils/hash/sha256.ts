import { sha256 as noble_sha256 } from '@noble/hashes/sha256'

import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type ToHexErrorType, toHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type Sha256Hash<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type Sha256ErrorType =
  | IsHexErrorType
  | ToBytesErrorType
  | ToHexErrorType
  | ErrorType

export function sha256<to extends To = 'hex'>(
  value: Hex | ByteArray,
  to_?: to | undefined,
): Sha256Hash<to> {
  const to = to_ || 'hex'
  const bytes = noble_sha256(
    isHex(value, { strict: false }) ? toBytes(value) : value,
  )
  if (to === 'bytes') return bytes as Sha256Hash<to>
  return toHex(bytes) as Sha256Hash<to>
}
