import type { ErrorType } from '../../errors/utils.js'
import type { Authorization } from '../../types/authorization.js'
import type { Hex } from '../../types/misc.js'
import {
  type HashAuthorizationErrorType,
  hashAuthorization,
} from '../../utils/signature/hashAuthorization.js'
import { type SignErrorType, sign } from './sign.js'

export type SignAuthorizationParameters = {
  /** The authorization to sign. */
  authorization: Authorization<number, false>
  /** The private key to sign with. */
  privateKey: Hex
}

export type SignAuthorizationReturnType = Hex

export type SignAuthorizationErrorType =
  | SignErrorType
  | HashAuthorizationErrorType
  | ErrorType

/**
 * Signs an "authorization tuple" hash in [EIP-7702 format](https://eips.ethereum.org/EIPS/eip-7702): `keccak256('0x05' || rlp([chain_id, address, nonce]))`.
 */
export async function signAuthorization(
  parameters: SignAuthorizationParameters,
): Promise<SignAuthorizationReturnType> {
  const { authorization, privateKey } = parameters
  return await sign({
    hash: hashAuthorization(authorization),
    privateKey,
    to: 'hex',
  })
}
