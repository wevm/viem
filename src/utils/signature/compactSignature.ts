import type { CompactSignature, Signature } from '../../types/misc.js'
import { bytesToHex, hexToBytes } from '../index.js'

// [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098)
export function compactSignature(signature: Signature): CompactSignature {
  const { r, s, v } = signature
  const yParity = v - 27n
  let yParityAndS = s
  if (yParity === 1n) {
    const bytes = hexToBytes(s)
    bytes[0] |= 0x80
    yParityAndS = bytesToHex(bytes)
  }
  return { r, yParityAndS }
}
