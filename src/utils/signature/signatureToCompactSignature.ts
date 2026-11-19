import type { ErrorType } from '../../errors/utils.js'
import type { CompactSignature, Signature } from '../../types/misc.js'
import { type PadErrorType, pad } from '../data/pad.js'
import { type HexToBytesErrorType, hexToBytes } from '../encoding/toBytes.js'
import { type BytesToHexErrorType, bytesToHex } from '../encoding/toHex.js'

export type SignatureToCompactSignatureErrorType =
  | HexToBytesErrorType
  | BytesToHexErrorType
  | PadErrorType
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
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1) return yParity
    if (v === 0n || v === 1n) return Number(v)
    if (v && (v === 27n || v === 28n || v >= 35n)) return v % 2n === 0n ? 1 : 0
    throw new Error('Invalid `v` or `yParity` value')
  })()
  const bytes = hexToBytes(pad(s))
  // EIP-2098 stores yParity in the top bit, which is always clear for a low `s`.
  if (bytes[0] & 0x80) throw new Error('Invalid `s` value')
  if (yParity_ === 1) bytes[0] |= 0x80
  return { r: pad(r), yParityAndS: bytesToHex(bytes) }
}
