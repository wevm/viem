// TODO(v3): Convert to sync.

import { secp256k1 } from '@noble/curves/secp256k1'

import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex, Signature } from '../../types/misc.js'
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

export type SignErrorType = NumberToHexErrorType | ErrorType

let extraEntropy: Hex | boolean = false

/**
 * Sets extra entropy for signing functions.
 */
export function setSignEntropy(entropy: true | Hex) {
  if (!entropy) throw new Error('must be a `true` or a hex value.')
  extraEntropy = entropy
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
  const { r, s, recovery } = secp256k1.sign(
    hash.slice(2),
    privateKey.slice(2),
    { lowS: true, extraEntropy },
  )
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery,
  }
  return (() => {
    if (to === 'bytes' || to === 'hex')
      return serializeSignature({ ...signature, to })
    return signature
  })() as SignReturnType<to>
}
