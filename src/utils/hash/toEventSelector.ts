import type { ErrorType } from '../../errors/utils.js'
import {
  type ToSignatureHashErrorType,
  toSignatureHash,
} from './toSignatureHash.js'

export type ToEventSelectorErrorType = ToSignatureHashErrorType | ErrorType

/**
 * Returns the event selector for a given event definition.
 *
 * @example
 * const selector = toEventSelector('Transfer(address indexed from, address indexed to, uint256 amount)')
 * // 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
 */
export const toEventSelector = toSignatureHash
