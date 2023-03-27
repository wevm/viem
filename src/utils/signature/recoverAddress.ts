import { recoverPublicKey } from '@noble/secp256k1'
import type { Address, ByteArray, Hex } from '../../types/index.js'
import { checksumAddress } from '../address/index.js'
import { isHex } from '../data/index.js'
import { hexToNumber, toHex } from '../encoding/index.js'
import { keccak256 } from '../hash/index.js'

export type RecoverAddressParameters = {
  hash: Hex | ByteArray
  signature: Hex | ByteArray
}
export type RecoverAddressReturnType = Address

export function recoverAddress({
  hash,
  signature,
}: RecoverAddressParameters): RecoverAddressReturnType {
  const signatureHex = isHex(signature) ? signature : toHex(signature)
  const hashHex = isHex(hash) ? hash : toHex(hash)

  // Derive v = recoveryId + 27 from end of the signature (27 is added when signing the message)
  // The recoveryId represents the y-coordinate on the secp256k1 elliptic curve and can have a value [0, 1].
  const v = hexToNumber(`0x${signatureHex.slice(130)}`)

  const publicKey = toHex(
    recoverPublicKey(
      hashHex.substring(2),
      signatureHex.substring(2, 130),
      v - 27,
    ),
  )
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26)
  return checksumAddress(`0x${address}`) as Address
}
