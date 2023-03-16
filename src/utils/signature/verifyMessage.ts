import type { Address } from 'abitype'
import type { Hex, ByteArray } from '../../types'
import { getAddress, isAddressEqual, recoverMessageAddress } from '../../utils'

export type VerifyMessageParameters = {
  address: Address
  message: string
  signature: Hex | ByteArray
}

export type VerifyMessageReturnType = boolean

export function verifyMessage({
  address,
  message,
  signature,
}: VerifyMessageParameters): VerifyMessageReturnType {
  return isAddressEqual(
    getAddress(address),
    recoverMessageAddress({ message, signature }),
  )
}
