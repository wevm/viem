import type { Address } from 'abitype'
import type { Hex, ByteArray } from '../../types/index.js'
import { getAddress, isAddressEqual, recoverMessageAddress } from '../index.js'

export type VerifyMessageParameters = {
  address: Address
  message: string
  signature: Hex | ByteArray
}

export type VerifyMessageReturnType = boolean

export async function verifyMessage({
  address,
  message,
  signature,
}: VerifyMessageParameters): Promise<VerifyMessageReturnType> {
  return isAddressEqual(
    getAddress(address),
    await recoverMessageAddress({ message, signature }),
  )
}
