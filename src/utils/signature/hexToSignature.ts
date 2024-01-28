import { secp256k1 } from '@noble/curves/secp256k1'

import type { ErrorType } from '../../errors/utils.js'
import type { Hex, Signature } from '../../types/misc.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type HexToSignatureErrorType = NumberToHexErrorType | ErrorType

/**
 * @description Parses a hex formatted signature into a structured signature.
 *
 * @param signatureHex Signature in hex format.
 * @returns The structured signature.
 *
 * @example
 * hexToSignature('0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c')
 * // { r: '0x...', s: '0x...', v: 28n }
 */
export function hexToSignature(signatureHex: Hex): Signature {
  const { r, s } = secp256k1.Signature.fromCompact(signatureHex.slice(2, 130))
  const v = BigInt(`0x${signatureHex.slice(130)}`)
  return {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v,
    yParity: v === 28n ? 1 : 0,
  }
}
