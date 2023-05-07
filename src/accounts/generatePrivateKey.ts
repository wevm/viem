import { secp256k1 } from '@noble/curves/secp256k1'

import type { Hex } from '../types/misc.js'
import { toHex } from '../utils/encoding/toHex.js'

/**
 * @description Generates a random private key.
 *
 * @returns A randomly generated private key.
 */
export function generatePrivateKey(): Hex {
  return toHex(secp256k1.utils.randomPrivateKey())
}
