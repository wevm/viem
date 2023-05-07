import type { Hex } from '../../types/misc.js'
import { isHex } from '../data/isHex.js'
import { size } from '../data/size.js'

export function isHash(hash: string): hash is Hex {
  return isHex(hash) && size(hash) === 32
}
