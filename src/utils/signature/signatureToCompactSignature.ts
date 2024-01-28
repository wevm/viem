import type { ErrorType } from '../../errors/utils.js'
import type { CompactSignature, Signature } from '../../types/misc.js'
import {
  type BytesToHexErrorType,
  type HexToBytesErrorType,
  bytesToHex,
  hexToBytes,
} from '../index.js'

export type SignatureToCompactSignatureErrorType =
  | HexToBytesErrorType
  | BytesToHexErrorType
  | ErrorType

/**
 * @description Converts a signature into an [EIP-2098 compact signature](https://eips.ethereum.org/EIPS/eip-2098).
 *
 * @param signature The signature to convert.
 * @returns The signature in compact format.
 *
 * @example
 * signatureToCompactSignature({
 *   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 *   s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 *   yParity: 0
 * })
 * // {
 * //   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 * //   yParityAndS: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064'
 * // }
 */
export function signatureToCompactSignature(
  signature: Signature,
): CompactSignature {
  const { r, s, v, yParity } = signature
  const yParity_ = Number(yParity ?? v! - 27n)
  let yParityAndS = s
  if (yParity_ === 1) {
    const bytes = hexToBytes(s)
    bytes[0] |= 0x80
    yParityAndS = bytesToHex(bytes)
  }
  return { r, yParityAndS }
}
