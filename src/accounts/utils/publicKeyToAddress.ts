import type { Address, Hex } from '../../types'
import { keccak256 } from '../../utils'
import { checksumAddress } from '../../utils/address'

export function publicKeyToAddress(publicKey: Hex): Address {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26)
  return checksumAddress(`0x${address}`) as Address
}
