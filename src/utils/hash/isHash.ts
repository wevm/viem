import type { Hex } from '../../types'
import { size } from '../data'

export function isHash(hash: string): hash is Hex {
  return hash.startsWith('0x') && size(hash as Hex) === 32
}
