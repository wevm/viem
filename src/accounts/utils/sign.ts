import { sign as sign_, Signature as Signature_ } from '@noble/secp256k1'

import type { Hex, Signature } from '../../types'
import { toHex } from '../../utils'

export type SignParameters = {
  hash: Hex
  privateKey: Hex
}
export type SignReturnType = Signature

/**
 * @description Signs a hash with a given private key.
 *
 * @param hash The hash to sign.
 * @param privateKey The private key to sign with.
 *
 * @returns The signature.
 */
export async function sign({
  hash,
  privateKey,
}: SignParameters): Promise<SignReturnType> {
  const [sigBytes, recId] = await sign_(hash.slice(2), privateKey.slice(2), {
    canonical: true,
    recovered: true,
  })
  const sig = Signature_.fromHex(sigBytes)
  return {
    r: toHex(sig.r),
    s: toHex(sig.s),
    v: recId ? 28n : 27n,
  }
}
