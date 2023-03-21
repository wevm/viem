import { sign as sign_, Signature } from '@noble/secp256k1'

import type { Hex } from '../../types'

export type SignParameters = {
  hash: Hex
  privateKey: Hex
}
export type SignReturnType = Hex

export async function sign({
  hash,
  privateKey,
}: SignParameters): Promise<SignReturnType> {
  const [signature, recId] = await sign_(hash.slice(2), privateKey.slice(2), {
    canonical: true,
    recovered: true,
  })
  return `0x${Signature.fromHex(signature).toCompactHex()}${
    recId ? '1c' : '1b'
  }`
}
