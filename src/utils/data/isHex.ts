import type { Hex } from '../../types/misc.js'

export function isHex(value: unknown): value is Hex {
  if (!value) return false
  if (typeof value !== 'string') return false
  return /^0x[0-9a-fA-F]*$/.test(value)
}
