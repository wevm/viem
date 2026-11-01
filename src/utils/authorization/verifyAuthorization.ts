import type { Address } from 'abitype'

import { InvalidYParityError } from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import { type GetAddressErrorType, getAddress } from '../address/getAddress.js'
import {
  type IsAddressEqualErrorType,
  isAddressEqual,
} from '../address/isAddressEqual.js'
import {
  type RecoverAuthorizationAddressErrorType,
  type RecoverAuthorizationAddressParameters,
  recoverAuthorizationAddress,
} from './recoverAuthorizationAddress.js'

export type VerifyAuthorizationParameters =
  RecoverAuthorizationAddressParameters & {
    /** The address that signed the Authorization object. */
    address: Address
  }

export type VerifyAuthorizationReturnType = boolean

export type VerifyAuthorizationErrorType =
  | IsAddressEqualErrorType
  | GetAddressErrorType
  | RecoverAuthorizationAddressErrorType
  | ErrorType

/**
 * Verify that an Authorization object was signed by the provided address.
 *
 * - Docs {@link https://viem.sh/docs/utilities/verifyAuthorization}
 *
 * @param parameters - {@link VerifyAuthorizationParameters}
 * @returns Whether or not the signature is valid. {@link VerifyAuthorizationReturnType}
 */
export async function verifyAuthorization({
  address,
  authorization,
  signature,
}: VerifyAuthorizationParameters): Promise<VerifyAuthorizationReturnType> {
  const recovered = await (async () => {
    try {
      return await recoverAuthorizationAddress({ authorization, signature })
    } catch (error) {
      // A `yParity` other than 0 or 1 has no authority under EIP-7702.
      if (error instanceof InvalidYParityError) return undefined
      throw error
    }
  })()
  if (!recovered) return false
  return isAddressEqual(getAddress(address), recovered)
}
