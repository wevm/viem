import type { ErrorType } from '../../errors/utils.js'
import type { CompactSignature, Signature } from '../../types/misc.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

export type CompactSignatureToSignatureErrorType =
  | BytesToHexErrorType
  | HexToBytesErrorType
  | ErrorType

/**
 * @description Converts an [EIP-2098 compact signature](https://eips.ethereum.org/EIPS/eip-2098) into signature format.
 *
 * @param signature The compact signature to convert.
 * @returns The compact signature in signature format.
 *
 * @example
 * compactSignatureToHex({
 *   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 *   yParityAndS: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 * })
 * // {
 * //   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 * //   s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 * //   v: 27n
 * // }
 */
export function compactSignatureToSignature({
  r,
  yParityAndS,
}: CompactSignature): Signature {
  const yParityAndS_bytes = hexToBytes(yParityAndS)
  const yParity = yParityAndS_bytes[0] & 0x80 ? 1 : 0
  const s = yParityAndS_bytes
  if (yParity === 1) s[0] &= 0x7f
  return { r, s: bytesToHex(s), yParity }
}
