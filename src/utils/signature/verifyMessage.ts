import type { Address } from 'abitype'
import type { Hex, ByteArray } from '../../types'
import { getAddress, isAddressEqual, recoverMessageAddress } from '../../utils'

export type VerifyMessageParameters = {
  address: Address
  message: string
  signature: Hex | ByteArray
}

export type VerifyMessageReturnType = boolean

/**
 * Can be used to verify a message signed by a private key
 *
 * @private Should not be used directly, please use `publicClient.verifyMessage` instead
 * @param parameters
 * @returns true if the message was signed by the private key of provided address (EOA)
 */
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
