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
  type RecoverAuthMessageAddressErrorType,
  type RecoverAuthMessageAddressParameters,
  recoverAuthMessageAddress,
} from './recoverAuthMessageAddress.js'

export type VerifyAuthMessageParameters =
  RecoverAuthMessageAddressParameters & {
    /** The address that signed the original auth message. */
    address: Address
  }

export type VerifyAuthMessageReturnType = boolean

export type VerifyAuthMessageErrorType =
  | IsAddressEqualErrorType
  | GetAddressErrorType
  | RecoverAuthMessageAddressErrorType
  | ErrorType

/**
 * Verify that a auth message was signed by the provided address.
 *
 * @param parameters - {@link VerifyAuthMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifyAuthMessageReturnType}
 */
export async function verifyAuthMessage({
  address,
  ...parameters
}: VerifyAuthMessageParameters): Promise<VerifyAuthMessageReturnType> {
  return isAddressEqual(
    getAddress(address),
    await recoverAuthMessageAddress(parameters),
  )
}
