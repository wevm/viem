import type { Address } from 'abitype'

import type { ErrorType } from '../../../errors/utils.js'
import {
  type GetAddressErrorType,
  getAddress,
} from '../../../utils/address/getAddress.js'
import {
  type IsAddressEqualErrorType,
  isAddressEqual,
} from '../../../utils/address/isAddressEqual.js'
import {
  type RecoverAuthorizationAddressErrorType,
  type RecoverAuthorizationAddressParameters,
  recoverAuthorizationAddress,
} from './recoverAuthorizationAddress.js'

export type VerifyAuthorizationParameters =
  RecoverAuthorizationAddressParameters & {
    /** The address that signed the Authorization tuple. */
    address: Address
  }

export type VerifyAuthorizationReturnType = boolean

export type VerifyAuthorizationErrorType =
  | IsAddressEqualErrorType
  | GetAddressErrorType
  | RecoverAuthorizationAddressErrorType
  | ErrorType

/**
 * Verify that an "authorization tuple" was signed by the provided address.
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
  return isAddressEqual(
    getAddress(address),
    await recoverAuthorizationAddress({
      authorization,
      signature,
    }),
  )
}
