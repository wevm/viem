import { type ByteArray, type Hex, isHex, toBytes } from '../../index.js'
import { equalBytes } from '@noble/curves/abstract/utils'

export function isBytesEqual(a_: ByteArray | Hex, b_: ByteArray | Hex) {
  const a = isHex(a_) ? toBytes(a_) : a_
  const b = isHex(b_) ? toBytes(b_) : b_
  return equalBytes(a, b)
}
