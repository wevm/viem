import { sign, Signature } from '@noble/secp256k1'

import type { Hex } from '../../types'
import { hashMessage } from '../../utils'

export type SignMessageParameters = {
  message: string
  privateKey: Hex
}
export type SignMessageReturnType = Hex

export async function signMessage({
  message,
  privateKey,
}: SignMessageParameters): Promise<SignMessageReturnType> {
  const messageHash = hashMessage(message)
  const signature = await sign(messageHash.slice(2), privateKey.slice(2))
  return `0x${Signature.fromHex(signature).toCompactHex()}`
}
