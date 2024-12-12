import {
  type AbiEvent,
  type AbiFunction,
  type SignatureAbiItem,
  formatAbiItem,
} from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import {
  type NormalizeSignatureErrorType,
  type ToSignature,
  normalizeSignature,
} from './normalizeSignature.js'

export type ToSignatureErrorType = NormalizeSignatureErrorType | ErrorType

/**
 * Returns the signature for a given function or event definition.
 *
 * @example
 * const signature = toSignature('function ownerOf(uint256 tokenId)')
 * // 'ownerOf(uint256)'
 *
 * @example
 * const signature_3 = toSignature({
 *   name: 'ownerOf',
 *   type: 'function',
 *   inputs: [{ name: 'tokenId', type: 'uint256' }],
 *   outputs: [],
 *   stateMutability: 'view',
 * })
 * // 'ownerOf(uint256)'
 */
export const toSignature = <const Def extends string | AbiFunction | AbiEvent>(
  def: Def,
): Def extends AbiFunction | AbiEvent
  ? SignatureAbiItem<Def>
  : Def extends string
    ? ToSignature<Def>
    : never => {
  const def_ = (() => {
    if (typeof def === 'string') return def
    return formatAbiItem(def)
  })()
  return normalizeSignature(def_) as ToSignature<typeof def_>
}
