import { utils } from '@noble/secp256k1'

import type { Hex } from '../types'
import { toHex } from '../utils'

export function generatePrivateKey(): Hex {
  return toHex(utils.randomPrivateKey())
}
