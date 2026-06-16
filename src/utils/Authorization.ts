export * from 'ox/Authorization'

import * as Address from 'ox/Address'
import * as Authorization from 'ox/Authorization'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Signature from 'ox/Signature'
import { secp256k1 } from '../core/Curve.js'
import type * as Curve from '../core/Curve.js'

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
  const { authorization, curve = secp256k1() } = options
  const signature = options.signature ?? Signature.extract(authorization)!
  const publicKey = curve.recoverPublicKey({
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
    /** Signing curve (defaults to `Curve.secp256k1`). */
    curve?: Curve.Recoverable | undefined
    /** Signature of the authorization (defaults to the one carried on a signed authorization). */
    signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
  }

  type ErrorType =
    | Authorization.getSignPayload.ErrorType
    | Address.fromPublicKey.ErrorType
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
 *   authorization,
 *   address, // or `publicKey`
 * })
 * ```
 */
export function verify<
  curve extends Curve.Curve<any> = ReturnType<typeof secp256k1>,
>(options: verify.Options<curve>): ReturnType<curve['verify']> {
  const {
    authorization,
    curve: curveOption,
    signature: signatureOption,
    ...rest
  } = options
  const curve = (curveOption ?? secp256k1()) as Curve.Curve<any>
  const signature = signatureOption ?? Signature.extract(authorization)!
  return curve.verify({
    payload: Authorization.getSignPayload(
      authorization as Authorization.Authorization,
    ),
    signature,
    ...rest,
  }) as ReturnType<curve['verify']>
}

export declare namespace verify {
  type Options<curve extends Curve.Curve<any> = ReturnType<typeof secp256k1>> =
    {
      /** The authorization (signed, or unsigned with an explicit `signature`). */
      authorization: Authorization.Authorization<boolean>
      /** Signing curve (defaults to `Curve.secp256k1`). */
      curve?: curve | undefined
      /** Signature of the authorization (defaults to the one carried on a signed authorization). */
      signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
    } & Omit<Curve.VerifyOptions<curve>, 'signature'>

  type ErrorType =
    | Authorization.getSignPayload.ErrorType
    | Errors.GlobalErrorType
}
