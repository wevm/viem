import type { Hex } from '../../types/index.js'
import { isHex, size } from '../data/index.js'

export function isHash(hash: string): hash is Hex {
  return isHex(hash) && size(hash) === 32
}
