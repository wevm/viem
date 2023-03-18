import type { Hex } from '../../types'

const hashRegex = /^0x[a-f0-9]{64}$/

export function isHash(hash: string): hash is Hex {
  return hashRegex.test(hash)
}
