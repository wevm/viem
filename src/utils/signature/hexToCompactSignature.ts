import { secp256k1 } from '@noble/curves/secp256k1'

import type { ErrorType } from '../../errors/utils.js'
import type { CompactSignature, Hex } from '../../types/misc.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type HexToCompactSignatureErrorType = NumberToHexErrorType | ErrorType

/**
 * @description Parses a hex formatted compact signature into a structured compact signature.
 *
 * @param signatureHex Signature in hex format.
 * @returns The structured signature.
 *
 * @example
 * hexToCompactSignature('0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c')
 * // { r: '0x...', yParityAndS: '0x...' }
 */
export function hexToCompactSignature(signatureHex: Hex): CompactSignature {
  const { r, s } = secp256k1.Signature.fromCompact(signatureHex.slice(2, 130))
  return {
    r: numberToHex(r, { size: 32 }),
    yParityAndS: numberToHex(s, { size: 32 }),
  }
}
