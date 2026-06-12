export * from 'ox/Authorization'

import type * as Address from 'ox/Address'
import * as Authorization from 'ox/Authorization'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'

/**
 * Recovers the authorizing address of an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)
 * authorization.
 *
 * @example
 * ```ts
 * import { Authorization } from 'viem'
 *
 * const address = Authorization.recoverAddress({
 *   authorization, // signed, or unsigned + explicit `signature`
 * })
 * ```
 */
export function recoverAddress(
  options: recoverAddress.Options,
): Address.Address {
  const { authorization } = options
  const signature = options.signature ?? Signature.extract(authorization)!
  return Secp256k1.recoverAddress({
    payload: Authorization.getSignPayload(
      authorization as Authorization.Authorization,
    ),
    signature,
  })
}

export declare namespace recoverAddress {
  type Options = {
    /** The authorization (signed, or unsigned with an explicit `signature`). */
    authorization: Authorization.Authorization<boolean>
    /** Signature of the authorization (defaults to the one carried on a signed authorization). */
    signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
  }

  type ErrorType =
    | Authorization.getSignPayload.ErrorType
    | Secp256k1.recoverAddress.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Verifies an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) authorization was signed by
 * the provided address.
 *
 * @example
 * ```ts
 * import { Authorization } from 'viem'
 *
 * const valid = Authorization.verify({
 *   address: '0x…',
 *   authorization,
 * })
 * ```
 */
export function verify(options: verify.Options): boolean {
  const { address, authorization } = options
  const signature = options.signature ?? Signature.extract(authorization)!
  return Secp256k1.verify({
    address,
    payload: Authorization.getSignPayload(
      authorization as Authorization.Authorization,
    ),
    signature,
  })
}

export declare namespace verify {
  type Options = {
    /** Address that signed the authorization. */
    address: Address.Address
    /** The authorization (signed, or unsigned with an explicit `signature`). */
    authorization: Authorization.Authorization<boolean>
    /** Signature of the authorization (defaults to the one carried on a signed authorization). */
    signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
  }

  type ErrorType =
    | Authorization.getSignPayload.ErrorType
    | Secp256k1.verify.ErrorType
    | Errors.GlobalErrorType
}
