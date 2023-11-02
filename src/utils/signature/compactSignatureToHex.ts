import { secp256k1 } from '@noble/curves/secp256k1'
import type { ErrorType } from '../../errors/utils.js'
import type { CompactSignature, Hex } from '../../types/misc.js'
import { type HexToBigIntErrorType, hexToBigInt } from '../encoding/fromHex.js'

export type CompactSignatureToHexErrorType = HexToBigIntErrorType | ErrorType

/**
 * @description Converts an [EIP-2098 compact signature](https://eips.ethereum.org/EIPS/eip-2098) into hex format.
 *
 * @param signature The compact signature to convert.
 * @returns The compact signature in hex format.
 *
 * @example
 * compactSignatureToHex({
 *   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 *   yParityAndS: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 * })
 * // "0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c"
 */
export function compactSignatureToHex({
  r,
  yParityAndS,
}: CompactSignature): Hex {
  return `0x${new secp256k1.Signature(
    hexToBigInt(r),
    hexToBigInt(yParityAndS),
  ).toCompactHex()}`
}
