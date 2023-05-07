import { keccak_256 } from '@noble/hashes/sha3'

import type { ByteArray, Hex } from '../../types/misc.js'
import { isHex } from '../data/isHex.js'
import { toBytes } from '../encoding/toBytes.js'
import { toHex } from '../encoding/toHex.js'

type To = 'hex' | 'bytes'

export type Keccak256Hash<TTo extends To> =
  | (TTo extends 'bytes' ? ByteArray : never)
  | (TTo extends 'hex' ? Hex : never)

export function keccak256<TTo extends To = 'hex'>(
  value: Hex | ByteArray,
  to_?: TTo,
): Keccak256Hash<TTo> {
  const to = to_ || 'hex'
  const bytes = keccak_256(isHex(value) ? toBytes(value) : value)
  if (to === 'bytes') return bytes as Keccak256Hash<TTo>
  return toHex(bytes) as Keccak256Hash<TTo>
}
