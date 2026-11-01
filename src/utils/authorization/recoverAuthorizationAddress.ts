import type { Address } from 'abitype'

import {
  InvalidYParityError,
  type InvalidYParityErrorType,
} from '../../errors/transaction.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  Authorization,
  AuthorizationRequest,
  SignedAuthorization,
} from '../../types/authorization.js'
import type { ByteArray, Hex, Signature } from '../../types/misc.js'
import type { OneOf } from '../../types/utils.js'
import {
  type RecoverAddressErrorType,
  recoverAddress,
} from '../signature/recoverAddress.js'
import {
  type HashAuthorizationErrorType,
  hashAuthorization,
} from './hashAuthorization.js'

export type RecoverAuthorizationAddressParameters<
  authorization extends OneOf<
    Authorization | AuthorizationRequest | SignedAuthorization
  > = OneOf<Authorization | AuthorizationRequest | SignedAuthorization>,
  //
  _signature = Hex | ByteArray | OneOf<Signature | SignedAuthorization>,
> = {
  /**
   * The Authorization object.
   *
   * - If an unsigned `authorization` is provided, the `signature` property is required.
   * - If a signed `authorization` is provided, the `signature` property does not need to be provided.
   */
  authorization:
    | authorization
    | OneOf<Authorization | AuthorizationRequest | SignedAuthorization>
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
  | InvalidYParityErrorType
  | RecoverAddressErrorType
  | ErrorType

export async function recoverAuthorizationAddress<
  const authorization extends OneOf<
    Authorization | AuthorizationRequest | SignedAuthorization
  >,
>(
  parameters: RecoverAuthorizationAddressParameters<authorization>,
): Promise<RecoverAuthorizationAddressReturnType> {
  const { authorization } = parameters
  const signature = (parameters.signature ?? authorization) as Signature

  // EIP-7702 recovers the authority with `y_parity` as the raw recovery id, so a
  // tuple with any other `yParity` (such as 27 or 28) has no authority.
  if (
    typeof signature === 'object' &&
    typeof signature.yParity === 'number' &&
    signature.yParity !== 0 &&
    signature.yParity !== 1
  )
    throw new InvalidYParityError({ yParity: BigInt(signature.yParity) })

  return recoverAddress({
    hash: hashAuthorization(authorization as AuthorizationRequest),
    signature,
  })
}
