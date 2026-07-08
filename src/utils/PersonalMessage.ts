export * from 'ox/PersonalMessage'

import { Address, Hex, PersonalMessage, Secp256k1 } from 'ox'
import type { Bytes, Errors, Signature } from 'ox'

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
  const { message, signature } = options
  const publicKey = Secp256k1.recoverPublicKey({
    payload: PersonalMessage.getSignPayload(toPayload(message)),
    signature,
  })
  return Address.fromPublicKey(publicKey)
}

export declare namespace recoverAddress {
  type Options = {
    /** The message that was signed. */
    message: SignableMessage
    /** Signature of the message. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

  type ErrorType =
    | PersonalMessage.getSignPayload.ErrorType
    | Secp256k1.recoverPublicKey.ErrorType
    | Address.fromPublicKey.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Verifies a personal ([EIP-191](https://eips.ethereum.org/EIPS/eip-191)) message was signed by
 * the provided address (or public key).
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
export function verify(options: verify.Options): boolean {
  const { message, ...rest } = options
  return Secp256k1.verify({
    payload: PersonalMessage.getSignPayload(toPayload(message)),
    ...rest,
  } as Secp256k1.verify.Options)
}

export declare namespace verify {
  type Options = {
    /** The message that was signed. */
    message: SignableMessage
  } & Omit<Secp256k1.verify.Options, 'hash' | 'payload'>

  type ErrorType =
    | PersonalMessage.getSignPayload.ErrorType
    | Secp256k1.verify.ErrorType
    | Errors.GlobalErrorType
}

/** @internal */
function toPayload(message: SignableMessage): Hex.Hex | Bytes.Bytes {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}
