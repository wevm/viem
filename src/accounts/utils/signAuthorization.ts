import type { ErrorType } from '../../errors/utils.js'
import type {
  AuthorizationRequest,
  SignedAuthorization,
} from '../../types/authorization.js'
import type { Hex, Signature } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import {
  type HashAuthorizationErrorType,
  hashAuthorization,
} from '../../utils/authorization/hashAuthorization.js'
import {
  type SignErrorType,
  type SignParameters,
  type SignReturnType,
  sign,
} from './sign.js'

type To = 'object' | 'bytes' | 'hex'

export type SignAuthorizationParameters<to extends To = 'object'> =
  AuthorizationRequest & {
    /** The private key to sign with. */
    privateKey: Hex
    to?: SignParameters<to>['to'] | undefined
  }

export type SignAuthorizationReturnType<to extends To = 'object'> = Prettify<
  to extends 'object' ? SignedAuthorization : SignReturnType<to>
>

export type SignAuthorizationErrorType =
  | SignErrorType
  | HashAuthorizationErrorType
  | ErrorType

/**
 * Signs an Authorization hash in [EIP-7702 format](https://eips.ethereum.org/EIPS/eip-7702): `keccak256('0x05' || rlp([chain_id, address, nonce]))`.
 */
export async function signAuthorization<to extends To = 'object'>(
  parameters: SignAuthorizationParameters<to>,
): Promise<SignAuthorizationReturnType<to>> {
  const { chainId, nonce, privateKey, to = 'object' } = parameters
  const address = parameters.contractAddress ?? parameters.address
  const signature = await sign({
    hash: hashAuthorization({ address, chainId, nonce }),
    privateKey,
    to,
  })
  if (to === 'object')
    return {
      address,
      chainId,
      nonce,
      ...(signature as Signature),
    } as any
  return signature as any
}
