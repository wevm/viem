import type { Address, ByteArray, Hex } from '../../types/index.js'
import { publicKeyToAddress } from '../accounts.js'
import { isHex } from '../data/index.js'
import { hexToNumber, toHex } from '../encoding/index.js'

export type RecoverAddressParameters = {
  hash: Hex | ByteArray
  signature: Hex | ByteArray
}
export type RecoverAddressReturnType = Address

export async function recoverAddress({
  hash,
  signature,
}: RecoverAddressParameters): Promise<RecoverAddressReturnType> {
  const signatureHex = isHex(signature) ? signature : toHex(signature)
  const hashHex = isHex(hash) ? hash : toHex(hash)

  // Derive v = recoveryId + 27 from end of the signature (27 is added when signing the message)
  // The recoveryId represents the y-coordinate on the secp256k1 elliptic curve and can have a value [0, 1].
  const v = hexToNumber(`0x${signatureHex.slice(130)}`)

  const { secp256k1 } = await import('@noble/curves/secp256k1')
  const publicKey = secp256k1.Signature.fromCompact(
    signatureHex.substring(2, 130),
  )
    .addRecoveryBit(v - 27)
    .recoverPublicKey(hashHex.substring(2))
    .toHex(false)
  return publicKeyToAddress(`0x${publicKey}`)
}
