import { keccak_256 } from '@noble/hashes/sha3'

import { encodeHex } from '../encoding'

export type Keccak256Options = {
  to?: 'hex' | 'bytes'
}

export function keccak256(
  value: Uint8Array,
  { to = 'hex' }: Keccak256Options = {},
) {
  const bytes = keccak_256(value)
  if (to === 'bytes') return bytes
  return encodeHex(bytes)
}
