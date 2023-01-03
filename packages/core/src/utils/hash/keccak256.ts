import { keccak_256 } from '@noble/hashes/sha3'

import type { Hex } from '../../types'

import { encodeHex } from '../encoding'

type To = 'hex' | 'bytes'

export type Keccak256Options<TTo extends To> = {
  to?: TTo
}
export type Keccak256Hash<TTo extends To> = TTo extends 'bytes'
  ? Uint8Array
  : TTo extends 'hex'
  ? Hex
  : never

export function keccak256<TTo extends To = 'hex'>(
  value: Uint8Array,
  { to: to_ }: Keccak256Options<TTo> = {},
): Keccak256Hash<TTo> {
  const to = to_ || 'hex'
  const bytes = keccak_256(value)
  if (to === 'bytes') return bytes as Keccak256Hash<TTo>
  return encodeHex(bytes) as Keccak256Hash<TTo>
}
