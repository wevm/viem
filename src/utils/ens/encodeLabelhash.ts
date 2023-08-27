import type { Hex } from '../../types/misc.js'

export function encodeLabelhash(hash: Hex): `[${string}]` {
  return `[${hash.slice(2)}]`
}
