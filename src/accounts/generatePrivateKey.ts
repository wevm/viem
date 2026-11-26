import { randomBytes } from '@noble/hashes/utils'

import type { ErrorType } from '../errors/utils.js'
import type { Hex } from '../types/misc.js'
import { bytesToBigInt } from '../utils/encoding/fromBytes.js'
import { numberToHex, type ToHexErrorType } from '../utils/encoding/toHex.js'

export type GeneratePrivateKeyErrorType = ToHexErrorType | ErrorType

/** Order of the secp256k1 group. */
const order =
  0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n

/**
 * @description Generates a random private key.
 *
 * @returns A randomly generated private key.
 */
export function generatePrivateKey(): Hex {
  // Reduces 48 random bytes into [1, n) with negligible modulo bias, as
  // `@noble/curves`' `randomPrivateKey` does, without bundling the curve.
  const key = (bytesToBigInt(randomBytes(48)) % (order - 1n)) + 1n
  return numberToHex(key, { size: 32 })
}
