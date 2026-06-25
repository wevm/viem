import type { ErrorType } from '../../../errors/utils.js'
import type { ByteArray, Hex } from '../../../types/misc.js'
import {
  type ConcatHexErrorType,
  concatHex,
} from '../../../utils/data/concat.js'
import {
  type HexToBytesErrorType,
  hexToBytes,
} from '../../../utils/encoding/toBytes.js'
import { toRlp } from '../../../utils/encoding/toRlp.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../../utils/hash/keccak256.js'
import { aaPayerType, aaTransactionType } from '../constants.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'
import { toTransactionBody } from './serializeTransaction.js'

type To = 'hex' | 'bytes'

export type GetSignatureHash8130Parameters<to extends To = 'hex'> =
  TransactionSerializable8130 & {
    /** Output format. @default 'hex' */
    to?: to | To | undefined
  }

export type GetSignatureHash8130ReturnType<to extends To = 'hex'> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type GetSenderSignatureHash8130ErrorType =
  | Keccak256ErrorType
  | ConcatHexErrorType
  | HexToBytesErrorType
  | ErrorType

/**
 * Computes the EIP-8130 **sender** signature hash — all transaction fields
 * through `payer`, excluding `sender_auth` and `payer_auth`:
 *
 * ```
 * keccak256(AA_TX_TYPE || rlp([
 *   chain_id, from, nonce_key, nonce_sequence, expiry,
 *   max_priority_fee_per_gas, max_fee_per_gas, gas_limit,
 *   account_changes, calls, payer
 * ]))
 * ```
 */
export function getSenderSignatureHash8130<to extends To = 'hex'>(
  parameters: GetSignatureHash8130Parameters<to>,
): GetSignatureHash8130ReturnType<to> {
  const { to = 'hex', payer } = parameters
  const hash = keccak256(
    concatHex([
      aaTransactionType,
      toRlp([...toTransactionBody(parameters), payer ?? '0x']),
    ]),
  )
  if (to === 'bytes')
    return hexToBytes(hash) as GetSignatureHash8130ReturnType<to>
  return hash as GetSignatureHash8130ReturnType<to>
}

export type GetPayerSignatureHash8130ErrorType =
  | Keccak256ErrorType
  | ConcatHexErrorType
  | HexToBytesErrorType
  | ErrorType

/**
 * Computes the EIP-8130 **payer** signature hash — the full transaction body
 * including the `payer` field, but excluding `sender_auth` and `payer_auth`:
 *
 * ```
 * keccak256(AA_PAYER_TYPE || rlp([
 *   chain_id, from, nonce_key, nonce_sequence, expiry,
 *   max_priority_fee_per_gas, max_fee_per_gas, gas_limit,
 *   account_changes, calls, metadata, payer
 * ]))
 * ```
 *
 * This matches the Rust node's `payer_signature_hash` which encodes all fields
 * of the transaction body including the `payer` slot (mirrors `rlp_encode_fields`
 * in `TxEip8130`).
 *
 * @remarks
 * `from` MUST be the **resolved** sender address. In the EOA path (`from`
 * omitted from the wire format) the recovered sender address MUST be set on
 * `parameters.from` before computing this hash, to bind the payer's signature to
 * the specific sender and prevent cross-sender replay.
 */
export function getPayerSignatureHash8130<to extends To = 'hex'>(
  parameters: GetSignatureHash8130Parameters<to>,
): GetSignatureHash8130ReturnType<to> {
  const { to = 'hex', payer } = parameters
  const hash = keccak256(
    concatHex([
      aaPayerType,
      toRlp([...toTransactionBody(parameters), payer ?? '0x']),
    ]),
  )
  if (to === 'bytes')
    return hexToBytes(hash) as GetSignatureHash8130ReturnType<to>
  return hash as GetSignatureHash8130ReturnType<to>
}
