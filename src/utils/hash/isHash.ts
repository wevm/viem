import type { Hex } from '../../types/index.js'
import { size } from '../data/index.js'

export function isHash(hash: string): hash is Hex {
  return hash.startsWith('0x') && size(hash as Hex) === 32
}
