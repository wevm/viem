import { Address } from 'abitype'
import { Hex, ByteArray } from '../../types'
import { getAddress, isAddressEqual, recoverAddress } from '../../utils'

export type VerifyMessageParameters = {
  address: Address
  messageHash: Hex | ByteArray
  signature: Hex | ByteArray
}

export type VerifyMessageReturnType = boolean

export function verifyMessage({
  address,
  messageHash,
  signature,
}: VerifyMessageParameters): VerifyMessageReturnType {
  return isAddressEqual(
    getAddress(address),
    recoverAddress(messageHash, signature),
  )
}
