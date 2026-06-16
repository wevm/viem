export * from 'ox/TxEnvelope'

import * as Address from 'ox/Address'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Signature from 'ox/Signature'
import * as TxEnvelope from 'ox/TxEnvelope'
import { secp256k1 } from '../core/Curve.js'
import type * as Curve from '../core/Curve.js'

/**
 * Recovers the signing address of a transaction envelope, either serialized
 * (hex) or deserialized (object).
 *
 * @example
 * ```ts
 * import { TxEnvelope } from 'viem'
 *
 * const address = TxEnvelope.recoverAddress('0x02f8…') // signed, or pass `signature` for unsigned
 * const address = TxEnvelope.recoverAddress(envelope, { signature })
 * ```
 */
export function recoverAddress(
  transaction: TxEnvelope.TxEnvelope | TxEnvelope.Serialized,
  options: recoverAddress.Options = {},
): Address.Address {
  const { curve = secp256k1() } = options
  const envelope =
    typeof transaction === 'string'
      ? TxEnvelope.deserialize(transaction)
      : transaction
  const signature = options.signature ?? Signature.extract(envelope)!
  const publicKey = curve.recoverPublicKey({
    payload: TxEnvelope.getSignPayload(
      envelope as TxEnvelope.TxEnvelope<false>,
    ),
    signature,
  })
  return Address.fromPublicKey(publicKey)
}

export declare namespace recoverAddress {
  type Options = {
    /** Signing curve (defaults to `Curve.secp256k1`). */
    curve?: Curve.Recoverable | undefined
    /** Signature of the transaction (defaults to the one carried on a signed transaction). */
    signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
  }

  type ErrorType =
    | TxEnvelope.deserialize.ErrorType
    | TxEnvelope.getSignPayload.ErrorType
    | Address.fromPublicKey.ErrorType
    | Errors.GlobalErrorType
}
