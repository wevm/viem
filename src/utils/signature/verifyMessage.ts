import type { Address } from 'abitype'
import type { Hex, ByteArray } from '../../types'
import { getAddress, isAddressEqual, recoverMessageAddress } from '../../utils'

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
