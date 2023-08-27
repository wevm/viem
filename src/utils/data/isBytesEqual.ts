import { equalBytes } from '@noble/curves/abstract/utils'

import type { ByteArray, Hex } from '../../types/misc.js'
import { toBytes } from '../encoding/toBytes.js'
import { isHex } from './isHex.js'

export function isBytesEqual(a_: ByteArray | Hex, b_: ByteArray | Hex) {
  const a = isHex(a_) ? toBytes(a_) : a_
  const b = isHex(b_) ? toBytes(b_) : b_
  return equalBytes(a, b)
}
