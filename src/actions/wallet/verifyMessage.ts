import { verify } from '@noble/secp256k1'
import { Address } from 'abitype'
import type { WalletClient } from '../../clients'
import { ByteArray, Hex } from '../../types'
import { isHex, toHex } from '../../utils'

export type VerifyMessageParameters = {
  messageHash: Hex | ByteArray
  signature: Hex | ByteArray
  address: Address
}

export type VerifyMessageReturnType = boolean

export async function verifyMessage(
  _client: WalletClient,
  { messageHash, signature, address }: VerifyMessageParameters,
): Promise<VerifyMessageReturnType> {
  const signatureHex = isHex(signature) ? signature : toHex(signature)
  const messageHashHex = isHex(messageHash) ? messageHash : toHex(messageHash)
  return verify(
    signatureHex.substring(2, 130),
    messageHashHex.substring(2),
    address,
  )
}
