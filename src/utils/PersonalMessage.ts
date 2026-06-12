export * from 'ox/PersonalMessage'

import type * as Address from 'ox/Address'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as PersonalMessage from 'ox/PersonalMessage'
import * as Secp256k1 from 'ox/Secp256k1'
import type * as Signature from 'ox/Signature'

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
  return Secp256k1.recoverAddress({
    payload: PersonalMessage.getSignPayload(toPayload(message)),
    signature,
  })
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
    | Secp256k1.recoverAddress.ErrorType
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
 *   address: '0x…',
 *   message: 'hello world',
 *   signature: '0x…',
 * })
 * ```
 */
export function verify(options: verify.Options): boolean {
  const { address, message, signature } = options
  return Secp256k1.verify({
    address,
    payload: PersonalMessage.getSignPayload(toPayload(message)),
    signature,
  })
}

export declare namespace verify {
  type Options = {
    /** Address that signed the message. */
    address: Address.Address
    /** The message that was signed. */
    message: SignableMessage
    /** Signature of the message. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

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
