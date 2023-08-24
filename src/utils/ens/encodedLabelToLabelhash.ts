import type { Hex } from '../../types/misc.js'
import { isHex } from '../data/isHex.js'

export function encodedLabelToLabelhash(label: string): Hex | null {
  if (label.length !== 66) return null
  if (label.indexOf('[') !== 0) return null
  if (label.indexOf(']') !== 65) return null
  const hash = `0x${label.slice(1, 65)}`
  if (!isHex(hash)) return null
  return hash
}
