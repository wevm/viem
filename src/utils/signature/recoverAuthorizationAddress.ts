import type { Address } from 'abitype'

import type { ByteArray, Hex, Signature } from '../../types/misc.js'

import type { ErrorType } from '../../errors/utils.js'
import type { Authorization } from '../../types/authorization.js'
import {
  type HashAuthorizationErrorType,
  hashAuthorization,
} from './hashAuthorization.js'
import {
  type RecoverAddressErrorType,
  recoverAddress,
} from './recoverAddress.js'

export type RecoverAuthorizationAddressParameters = {
  /** The authorization to recover the address from. */
  authorization: Authorization<number, false>
  /** Signature of the authorization item. */
  signature: Hex | ByteArray | Signature
}

export type RecoverAuthorizationAddressReturnType = Address

export type RecoverAuthorizationAddressErrorType =
  | HashAuthorizationErrorType
  | RecoverAddressErrorType
  | ErrorType

export async function recoverAuthorizationAddress(
  parameters: RecoverAuthorizationAddressParameters,
): Promise<RecoverAuthorizationAddressReturnType> {
  const { authorization, signature } = parameters
  return recoverAddress({
    hash: hashAuthorization(authorization),
    signature,
  })
}
