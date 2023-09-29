import { equalBytes } from '@noble/curves/abstract/utils'

import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type IsHexErrorType, isHex } from './isHex.js'

export type IsBytesEqualErrorType =
  | IsHexErrorType
  | ToBytesErrorType
  | ErrorType

export function isBytesEqual(a_: ByteArray | Hex, b_: ByteArray | Hex) {
  const a = isHex(a_) ? toBytes(a_) : a_
  const b = isHex(b_) ? toBytes(b_) : b_
  return equalBytes(a, b)
}
