import type { Address } from 'abitype'

import type { ErrorType } from '../../../errors/utils.js'
import type { ByteArray, Hex, Signature } from '../../../types/misc.js'
import type { OneOf } from '../../../types/utils.js'
import {
  type RecoverAddressErrorType,
  recoverAddress,
} from '../../../utils/signature/recoverAddress.js'
import type {
  Authorization,
  SignedAuthorization,
} from '../types/authorization.js'
import {
  type HashAuthorizationErrorType,
  hashAuthorization,
} from './hashAuthorization.js'

export type RecoverAuthorizationAddressParameters<
  authorization extends OneOf<Authorization | SignedAuthorization> = OneOf<
    Authorization | SignedAuthorization
  >,
  //
  _signature = Hex | ByteArray | OneOf<Signature | SignedAuthorization>,
> = {
  /**
   * The Authorization object.
   *
   * - If an unsigned `authorization` is provided, the `signature` property is required.
   * - If a signed `authorization` is provided, the `signature` property does not need to be provided.
   */
  authorization: authorization | OneOf<Authorization | SignedAuthorization>
} & (authorization extends SignedAuthorization
  ? {
      /** Signature of the Authorization. Not required if the `authorization` is signed. */
      signature?: _signature | undefined
    }
  : {
      /** Signature of the Authorization. Not required if the `authorization` is signed. */
      signature: _signature
    })

export type RecoverAuthorizationAddressReturnType = Address

export type RecoverAuthorizationAddressErrorType =
  | HashAuthorizationErrorType
  | RecoverAddressErrorType
  | ErrorType

export async function recoverAuthorizationAddress<
  const authorization extends OneOf<Authorization | SignedAuthorization>,
>(
  parameters: RecoverAuthorizationAddressParameters<authorization>,
): Promise<RecoverAuthorizationAddressReturnType> {
  const { authorization, signature } = parameters

  return recoverAddress({
    hash: hashAuthorization(authorization as Authorization),
    signature: (signature ?? authorization) as Signature,
  })
}
