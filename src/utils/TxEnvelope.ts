export * from 'ox/TxEnvelope'

import {
  Address,
  Secp256k1,
  Signature,
  TransactionEnvelope as TxEnvelope,
} from 'ox'
import type { Bytes, Errors, Hex } from 'ox'

/**
 * Recovers the signing address of a transaction envelope, either serialized
 * (hex) or deserialized (object).
 *
 * @example
 * ```ts
 * import { TxEnvelope } from 'viem/utils'
 *
 * const address = TxEnvelope.recoverAddress('0x02f8…') // signed, or pass `signature` for unsigned
 * const address = TxEnvelope.recoverAddress(envelope, { signature })
 * ```
 */
export function recoverAddress(
  transaction: TxEnvelope.TxEnvelope | TxEnvelope.Serialized,
  options: recoverAddress.Options = {},
): Address.Address {
  const envelope =
    typeof transaction === 'string'
      ? TxEnvelope.deserialize(transaction)
      : transaction
  const signature = options.signature ?? Signature.extract(envelope)!
  const publicKey = Secp256k1.recoverPublicKey({
    payload: TxEnvelope.getSignPayload(
      envelope as TxEnvelope.TxEnvelope<false>,
    ),
    signature,
  })
  return Address.fromPublicKey(publicKey)
}

export declare namespace recoverAddress {
  type Options = {
    /** Signature of the transaction (defaults to the one carried on a signed transaction). */
    signature?: Hex.Hex | Bytes.Bytes | Signature.Signature | undefined
  }

  type ErrorType =
    | TxEnvelope.deserialize.ErrorType
    | TxEnvelope.getSignPayload.ErrorType
    | Secp256k1.recoverPublicKey.ErrorType
    | Address.fromPublicKey.ErrorType
    | Errors.GlobalErrorType
}
