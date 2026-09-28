export * from 'ox/Authorization'

import { Address, Authorization, Errors, Secp256k1, Signature } from 'ox'
import type { Bytes, Hex } from 'ox'

/**
 * Recovers the authorizing address of an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)
 * authorization.
 *
 * @example
 * ```ts
 * import { Authorization } from 'viem/utils'
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
  const signature = options.signature ?? Signature.extract(authorization)
  if (!signature) throw new MissingSignatureError()
  const publicKey = Secp256k1.recoverPublicKey({
    payload: Authorization.getSignPayload(
      authorization as Authorization.Authorization,
    ),
    signature,
  })
  return Address.fromPublicKey(publicKey)
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
    | Secp256k1.recoverPublicKey.ErrorType
    | Address.fromPublicKey.ErrorType
    | MissingSignatureError
    | Errors.GlobalErrorType
}

/**
 * Verifies an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) authorization was signed by
 * the provided address (or public key).
 *
 * @example
 * ```ts
 * import { Authorization } from 'viem/utils'
 *
 * const valid = Authorization.verify({
 *   authorization,
 *   address, // or `publicKey`
 * })
 * ```
 */
export function verify(options: verify.Options): boolean {
  const { authorization, signature: signatureOption, ...rest } = options
  const signature = signatureOption ?? Signature.extract(authorization)
  if (!signature) throw new MissingSignatureError()
  return Secp256k1.verify({
    payload: Authorization.getSignPayload(
      authorization as Authorization.Authorization,
    ),
    signature,
    ...rest,
  } as Secp256k1.verify.Options)
}

export declare namespace verify {
  type Options = {
    /** The authorization (signed, or unsigned with an explicit `signature`). */
    authorization: Authorization.Authorization<boolean>
    /** Signature of the authorization (defaults to the one carried on a signed authorization). */
    signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
  } & Omit<Secp256k1.verify.Options, 'hash' | 'payload' | 'signature'>

  type ErrorType =
    | Authorization.getSignPayload.ErrorType
    | Secp256k1.verify.ErrorType
    | MissingSignatureError
    | Errors.GlobalErrorType
}

/** Thrown when an unsigned authorization is provided without a `signature` option. */
export class MissingSignatureError extends Errors.BaseError {
  override readonly name = 'Authorization.MissingSignatureError'

  constructor() {
    super(
      'Authorization is unsigned. An unsigned authorization requires a `signature` option.',
    )
  }
}
