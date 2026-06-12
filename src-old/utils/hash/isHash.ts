import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'
import { type SizeErrorType, size } from '../data/size.js'

export type IsHashErrorType = IsHexErrorType | SizeErrorType | ErrorType

export function isHash(hash: string): hash is Hex {
  return isHex(hash) && size(hash) === 32
}
