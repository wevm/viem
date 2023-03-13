import { recoverPublicKey } from '@noble/secp256k1'
import type { Address, ByteArray, Hex } from '../../types'
import { isHex } from '../data'
import { hexToNumber, toHex } from '../encoding'
import { keccak256 } from '../hash'
import { checksumAddress } from './getAddress'

export function recoverAddress(
  messageHash: Hex | ByteArray,
  signature: Hex | ByteArray,
): Address {
  const signatureHex = isHex(signature) ? signature : toHex(signature)
  const messageHashHex = isHex(messageHash) ? messageHash : toHex(messageHash)

  // Derive v = recoveryId + 27 from end of the signature (27 is added when signing the message)
  // The recoveryId represents the y-coordinate on the secp256k1 elliptic curve and can have a value [0, 1].
  const v = hexToNumber(`0x${signature.slice(130)}`)

  const publicKey = toHex(
    recoverPublicKey(
      messageHashHex.substring(2),
      signatureHex.substring(2, 130),
      v - 27,
    ),
  )
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26)
  return checksumAddress(`0x${address}`) as Address
}
