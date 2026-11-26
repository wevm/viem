import type { Hex } from '../../../types/misc.js'

/** Order of the secp256k1 group. */
const order =
  0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n

/**
 * Formats signature scalars as 64 bytes of hex, without the `0x` prefix.
 *
 * Checks each scalar is in `[1, n)`, as `@noble/curves`' `Signature` does, without bundling the curve.
 */
export function toCompactHex(r: bigint, s: bigint): string {
  return `${toScalarHex('r', r)}${toScalarHex('s', s)}`
}

/**
 * Reads signature scalars from 64 bytes of hex, without the `0x` prefix.
 *
 * Checks the length and each scalar, as `@noble/curves`' `Signature.fromCompact` does.
 */
export function fromCompactHex(hex: string): { r: Hex; s: Hex } {
  if (hex.length % 2 !== 0 || !/^[\da-f]*$/i.test(hex))
    throw new Error(
      `compactSignature must be hex string or Uint8Array, got "${hex}"`,
    )
  if (hex.length !== 128)
    throw new Error(
      `compactSignature of length 64 expected, got ${hex.length / 2}`,
    )
  const r = BigInt(`0x${hex.slice(0, 64)}`)
  const s = BigInt(`0x${hex.slice(64)}`)
  return { r: `0x${toScalarHex('r', r)}`, s: `0x${toScalarHex('s', s)}` }
}

function toScalarHex(title: 'r' | 's', value: bigint) {
  if (value < 1n || value >= order)
    throw new Error(`expected valid ${title}: 1 <= n < ${order}, got ${value}`)
  return value.toString(16).padStart(64, '0')
}
