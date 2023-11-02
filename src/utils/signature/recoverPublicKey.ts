import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../data/isHex.js'
import { type HexToNumberErrorType, hexToNumber } from '../encoding/fromHex.js'
import { toHex } from '../encoding/toHex.js'

export type RecoverPublicKeyParameters = {
  hash: Hex | ByteArray
  signature: Hex | ByteArray
}

export type RecoverPublicKeyReturnType = Hex

export type RecoverPublicKeyErrorType =
  | HexToNumberErrorType
  | IsHexErrorType
  | ErrorType

export async function recoverPublicKey({
  hash,
  signature,
}: RecoverPublicKeyParameters): Promise<RecoverPublicKeyReturnType> {
  const signatureHex = isHex(signature) ? signature : toHex(signature)
  const hashHex = isHex(hash) ? hash : toHex(hash)

  // Derive v = recoveryId + 27 from end of the signature (27 is added when signing the message)
  // The recoveryId represents the y-coordinate on the secp256k1 elliptic curve and can have a value [0, 1].
  let v = hexToNumber(`0x${signatureHex.slice(130)}`)
  if (v === 0 || v === 1) v += 27

  const { secp256k1 } = await import('@noble/curves/secp256k1')
  const publicKey = secp256k1.Signature.fromCompact(
    signatureHex.substring(2, 130),
  )
    .addRecoveryBit(v - 27)
    .recoverPublicKey(hashHex.substring(2))
    .toHex(false)
  return `0x${publicKey}`
}
