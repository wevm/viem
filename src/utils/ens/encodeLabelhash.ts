import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'

export type EncodeLabelhashErrorType = ErrorType

export function encodeLabelhash(hash: Hex): `[${string}]` {
  return `[${hash.slice(2)}]`
}
