import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'

export type IsHashErrorType = IsHexErrorType | ErrorType

export function isHash(hash: string): hash is Hex {
  return isHex(hash) && hash.length === 66
}
