import type { Address } from 'abitype'

import type { ErrorType } from '../../../errors/utils.js'
import type { Authorization } from '../../../types/authorization.js'
import {
  type RecoverAddressErrorType,
  recoverAddress,
} from '../../../utils/signature/recoverAddress.js'
import {
  type HashAuthorizationErrorType,
  hashAuthorization,
} from './hashAuthorization.js'
import type { ByteArray, Hex, Signature } from '../../../types/misc.js'
import type { OneOf, PartialBy } from '../../../types/utils.js'
import { BaseError } from '../../../errors/base.js'

export type RecoverAuthorizationAddressParameters = {
  /**
   * The Authorization.
   *
   * - If an unsigned `authorization` is provided, the `signature` property is required.
   * - If a signed `authorization` is provided, the `signature` property does not need to be provided.
   */
  authorization: OneOf<
    | PartialBy<Authorization<number, false>, 'chainId' | 'nonce'>
    | Authorization<number, true>
  >
  /** Signature of the Authorization. Not required if the `authorization` is signed. */
  signature?:
    | Hex
    | ByteArray
    | OneOf<Signature | Authorization<number, true>>
    | undefined
}

export type RecoverAuthorizationAddressReturnType = Address

export type RecoverAuthorizationAddressErrorType =
  | HashAuthorizationErrorType
  | RecoverAddressErrorType
  | ErrorType

export async function recoverAuthorizationAddress(
  parameters: RecoverAuthorizationAddressParameters,
): Promise<RecoverAuthorizationAddressReturnType> {
  const { signature } = parameters

  const authorization = (() => {
    if (!signature) return parameters.authorization
    if (typeof signature === 'string' || signature instanceof Uint8Array)
      return parameters.authorization
    return {
      ...parameters.authorization,
      chainId: parameters.authorization.chainId ?? signature.chainId,
      nonce: parameters.authorization.nonce ?? signature.nonce,
    }
  })()

  if (typeof authorization.chainId !== 'number')
    throw new BaseError('`authorization.chainId` is required')
  if (typeof authorization.nonce !== 'number')
    throw new BaseError('`authorization.nonce` is required')

  return recoverAddress({
    hash: hashAuthorization(authorization as Authorization),
    signature: (signature ?? authorization) as Signature,
  })
}
