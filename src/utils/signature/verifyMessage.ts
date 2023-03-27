import type { Address } from 'abitype'
import type { Hex, ByteArray } from '../../types/index.js'
import {
  getAddress,
  isAddressEqual,
  recoverMessageAddress,
} from '../../utils/index.js'

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
