import type { Address } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import { getAddress } from '../address/getAddress.js'
import { isAddressEqual } from '../address/isAddressEqual.js'

import { recoverMessageAddress } from './recoverMessageAddress.js'

export type VerifyMessageParameters = {
  address: Address
  message: string
  signature: Hex | ByteArray
}

export type VerifyMessageReturnType = boolean

/**
 * Can be used to verify a message signed by a private key
 *
 * - Docs {@link https://viem.sh/docs/utilities/verifyMessage.html}
 *
 * @private Should not be used directly, please use `publicClient.verifyMessage` instead
 * @param parameters - Object containing the message, signature and address to verify
 * @param parameters.address - The address to verify the message for
 * @param parameters.signature - The signature to verify
 * @param parameters.message - The message
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
