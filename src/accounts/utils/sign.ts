// TODO(v3): Convert to sync.

import { secp256k1 } from '@noble/curves/secp256k1.js'

import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex, Signature } from '../../types/misc.js'
import {
  type HexToBytesErrorType,
  hexToBytes,
} from '../../utils/encoding/toBytes.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import { serializeSignature } from '../../utils/signature/serializeSignature.js'

type To = 'object' | 'bytes' | 'hex'

export type SignParameters<to extends To = 'object'> = {
  hash: Hex
  privateKey: Hex
  to?: to | To | undefined
}

export type SignReturnType<to extends To = 'object'> =
  | (to extends 'object' ? Signature : never)
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type SignErrorType =
  | HexToBytesErrorType
  | NumberToHexErrorType
  | ErrorType

let extraEntropy: Uint8Array | boolean = false

/**
 * Sets extra entropy for signing functions.
 */
export function setSignEntropy(entropy: true | Hex) {
  if (!entropy) throw new Error('must be a `true` or a hex value.')
  extraEntropy = typeof entropy === 'string' ? hexToBytes(entropy) : entropy
}

/**
 * @description Signs a hash with a given private key.
 *
 * @param hash The hash to sign.
 * @param privateKey The private key to sign with.
 *
 * @returns The signature.
 */
export async function sign<to extends To = 'object'>({
  hash,
  privateKey,
  to = 'object',
}: SignParameters<to>): Promise<SignReturnType<to>> {
  const signatureBytes = secp256k1.sign(
    hexToBytes(hash),
    hexToBytes(privateKey),
    {
      prehash: false,
      lowS: true,
      extraEntropy,
      format: 'recovered',
    },
  )
  const nobleSignature = secp256k1.Signature.fromBytes(
    signatureBytes,
    'recovered',
  )
  const signature = {
    r: numberToHex(nobleSignature.r, { size: 32 }),
    s: numberToHex(nobleSignature.s, { size: 32 }),
    v: nobleSignature.recovery ? 28n : 27n,
    yParity: nobleSignature.recovery,
  }
  return (() => {
    if (to === 'bytes' || to === 'hex')
      return serializeSignature({ ...signature, to })
    return signature
  })() as SignReturnType<to>
}
