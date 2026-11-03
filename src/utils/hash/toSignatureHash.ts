import { type AbiEvent, type AbiFunction, formatAbiItem } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { LruMap } from '../lru.js'
import { type HashSignatureErrorType, hashSignature } from './hashSignature.js'
import { type ToSignatureErrorType, toSignature } from './toSignature.js'

/** Signature hashes keyed by their definition, since hashing is costly. */
const signatureHashCache = /*#__PURE__*/ new LruMap<Hex>(8192)

export type ToSignatureHashErrorType =
  | HashSignatureErrorType
  | ToSignatureErrorType
  | ErrorType

/**
 * Returns the hash (of the function/event/error signature) for a given function, event, or error definition.
 */
export function toSignatureHash(fn: string | AbiFunction | AbiEvent) {
  const definition = typeof fn === 'string' ? fn : formatAbiItem(fn)
  const cached = signatureHashCache.get(definition)
  if (cached) return cached
  const hash = hashSignature(toSignature(definition))
  signatureHashCache.set(definition, hash)
  return hash
}
