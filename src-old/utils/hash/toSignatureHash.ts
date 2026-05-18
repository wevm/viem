import type { AbiEvent, AbiFunction } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import { type HashSignatureErrorType, hashSignature } from './hashSignature.js'
import { type ToSignatureErrorType, toSignature } from './toSignature.js'

export type ToSignatureHashErrorType =
  | HashSignatureErrorType
  | ToSignatureErrorType
  | ErrorType

/**
 * Returns the hash (of the function/event signature) for a given event or function definition.
 */
export function toSignatureHash(fn: string | AbiFunction | AbiEvent) {
  return hashSignature(toSignature(fn))
}
