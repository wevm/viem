import { utils } from '@noble/secp256k1'

import type { Hex } from '../types'
import { toHex } from '../utils'

/**
 * @description Generates a random private key.
 *
 * @returns A randomly generated private key.
 */
export function generatePrivateKey(): Hex {
  return toHex(utils.randomPrivateKey())
}
