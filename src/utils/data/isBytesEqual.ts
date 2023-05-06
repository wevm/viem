import { equalBytes } from '@noble/curves/abstract/utils'
import { toBytes, type ByteArray, type Hex, isHex } from '../../index.js'

type Input = ByteArray | Hex
export function isBytesEqual(a: Input, b: Input) {
  const [A, B] = [a, b].map((x) => (isHex(x) ? toBytes(x) : x))

  return equalBytes(A, B)
}
