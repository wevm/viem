export * from 'ox/PersonalMessage'

import * as Address from 'ox/Address'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as PersonalMessage from 'ox/PersonalMessage'
import type * as Signature from 'ox/Signature'
import { secp256k1 } from '../core/Curve.js'
import type * as Curve from '../core/Curve.js'

/**
 * Message accepted by the personal-message helpers: a UTF-8 string, or a
 * raw payload (hex or bytes) signed as-is.
 */
export type SignableMessage = string | { raw: Hex.Hex | Bytes.Bytes }

/**
 * Recovers the signing address of a personal ([EIP-191](https://eips.ethereum.org/EIPS/eip-191))
 * message.
 *
 * @example
 * ```ts
 * import { PersonalMessage } from 'viem'
 *
 * const address = PersonalMessage.recoverAddress({
 *   message: 'hello world',
 *   signature: '0x…',
 * })
 * ```
 */
export function recoverAddress(
  options: recoverAddress.Options,
): Address.Address {
  const { curve = secp256k1(), message, signature } = options
  const publicKey = curve.recoverPublicKey({
    payload: PersonalMessage.getSignPayload(toPayload(message)),
    signature,
  })
  return Address.fromPublicKey(publicKey)
}

export declare namespace recoverAddress {
  type Options = {
    /** Signing curve (defaults to `Curve.secp256k1`). */
    curve?: Curve.Recoverable | undefined
    /** The message that was signed. */
    message: SignableMessage
    /** Signature of the message. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

  type ErrorType =
    | PersonalMessage.getSignPayload.ErrorType
    | Address.fromPublicKey.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Verifies a personal ([EIP-191](https://eips.ethereum.org/EIPS/eip-191)) message was signed by
 * the provided address.
 *
 * Plain ECDSA verification — no ERC-1271/ERC-6492 smart-account support.
 *
 * @example
 * ```ts
 * import { PersonalMessage } from 'viem'
 *
 * const valid = PersonalMessage.verify({
 *   message: 'hello world',
 *   address, // or `publicKey`
 *   signature: '0x…',
 * })
 * ```
 */
export function verify<
  curve extends Curve.Curve<any> = ReturnType<typeof secp256k1>,
>(options: verify.Options<curve>): ReturnType<curve['verify']> {
  const { curve: curveOption, message, ...rest } = options
  const curve = (curveOption ?? secp256k1()) as Curve.Curve<any>
  return curve.verify({
    payload: PersonalMessage.getSignPayload(toPayload(message)),
    ...rest,
  }) as ReturnType<curve['verify']>
}

export declare namespace verify {
  type Options<curve extends Curve.Curve<any> = ReturnType<typeof secp256k1>> =
    {
      /** Signing curve (defaults to `Curve.secp256k1`). */
      curve?: curve | undefined
      /** The message that was signed. */
      message: SignableMessage
    } & Curve.VerifyOptions<curve>

  type ErrorType =
    | PersonalMessage.getSignPayload.ErrorType
    | Errors.GlobalErrorType
}

/** @internal */
function toPayload(message: SignableMessage): Hex.Hex | Bytes.Bytes {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}
