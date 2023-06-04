import type { Hex } from '../../index.js'

export function encodeLabelhash(hash: Hex): `[${string}]` {
  return `[${hash.slice(2)}]`
}
