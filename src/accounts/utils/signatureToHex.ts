import type { Hex, type Signature } from '../../types/misc.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { secp256k1 } from '@noble/curves/secp256k1'

export function signatureToHex({ r, s, v }: Signature): Hex {
  return `0x${new secp256k1.Signature(
    hexToBigInt(r),
    hexToBigInt(s),
  ).toCompactHex()}${toHex(v).slice(2)}`
}
