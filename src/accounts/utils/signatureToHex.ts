import { Signature as Signature_ } from '@noble/secp256k1'

import type { Hex, Signature } from '../../types'
import { hexToBigInt, toHex } from '../../utils'

export function signatureToHex({ r, s, v }: Signature): Hex {
  return `0x${new Signature_(
    hexToBigInt(r),
    hexToBigInt(s),
  ).toCompactHex()}${toHex(v).slice(2)}`
}
