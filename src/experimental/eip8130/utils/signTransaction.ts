import type { Address } from 'abitype'
import type { LocalAccount } from '../../../accounts/types.js'
import { BaseError } from '../../../errors/base.js'
import type { ErrorType } from '../../../errors/utils.js'
import {
  type ConcatHexErrorType,
  concatHex,
} from '../../../utils/data/concat.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type {
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import {
  type GetPayerSignatureHash8130ErrorType,
  type GetSenderSignatureHash8130ErrorType,
  getPayerSignatureHash8130,
  getSenderSignatureHash8130,
} from './hashTransaction.js'
import {
  type SerializeTransaction8130ErrorType,
  serializeTransaction8130,
} from './serializeTransaction.js'

/**
 * A signer capable of producing an authenticator `data` blob over a hash.
 *
 * For the native secp256k1 path `sign` returns a raw 65-byte ECDSA signature.
 * For non-ECDSA authenticators (P-256, WebAuthn/passkey, delegate) `sign`
 * returns the authenticator-specific `data` (the bytes after the 20-byte
 * authenticator prefix), and `authenticator` identifies the authenticator
 * contract that validates it.
 */
export type Signer = Pick<LocalAccount, 'address'> & {
  sign?:
    | ((parameters: { hash: `0x${string}` }) => Promise<`0x${string}`>)
    | undefined
  /**
   * Authenticator address for this signer's auth blob. Defaults to
   * `ECRECOVER_AUTHENTICATOR` (native secp256k1). Set to a P-256 / WebAuthn /
   * delegate authenticator to sign as a non-ECDSA configured actor.
   */
  authenticator?: Address | undefined
}

export type SignTransaction8130Parameters = {
  transaction: TransactionSerializable8130
  /**
   * Sender signer (secp256k1). Used to produce `sender_auth` over the sender
   * signature hash. Not required if `transaction.senderAuth` is already set.
   *
   * - EOA path (`transaction.from` unset): `sender_auth` is the raw 65-byte
   *   signature and the recovered address is the sender.
   * - Configured-actor path (`transaction.from` set): `sender_auth` is
   *   `ECRECOVER_AUTHENTICATOR || signature`.
   */
  account?: Signer | undefined
  /**
   * Authenticator for the sender's `auth` blob (configured-actor path). Defaults
   * to `account.authenticator`, then `ECRECOVER_AUTHENTICATOR`. Set to a P-256 /
   * WebAuthn (passkey) / delegate authenticator to sign as a non-ECDSA actor.
   */
  authenticator?: Address | undefined
  /**
   * Payer signer for sponsored transactions. Produces `payer_auth` as
   * `authenticator || data` over the payer signature hash. Defaults the
   * authenticator to `ECRECOVER_AUTHENTICATOR` (native secp256k1).
   */
  payer?:
    | {
        account: Signer
        /** The `payer` wire address. Defaults to the payer account's address. */
        address?: Address | undefined
        /**
         * Authenticator for the payer's `auth` blob. Defaults to
         * `account.authenticator`, then `ECRECOVER_AUTHENTICATOR`.
         */
        authenticator?: Address | undefined
      }
    | undefined
}

export type SignTransaction8130ErrorType =
  | GetSenderSignatureHash8130ErrorType
  | GetPayerSignatureHash8130ErrorType
  | SerializeTransaction8130ErrorType
  | ConcatHexErrorType
  | ErrorType

/**
 * Signs an EIP-8130 (`AA_TX_TYPE`) transaction.
 *
 * Produces `sender_auth` (and, for sponsored transactions, `payer_auth`) and
 * returns the serialized envelope. Defaults to native secp256k1
 * (`ECRECOVER_AUTHENTICATOR`); pass `authenticator` (and/or `payer.authenticator`,
 * or set `authenticator` on the signer) to sign as a P-256 / WebAuthn (passkey) /
 * delegate configured actor, in which case the signer's `sign` returns the
 * authenticator-specific `data`. Presetting `transaction.senderAuth` /
 * `transaction.payerAuth` skips the corresponding signer entirely.
 */
export async function signTransaction8130(
  parameters: SignTransaction8130Parameters,
): Promise<TransactionSerialized8130> {
  const { account, payer } = parameters
  const transaction: TransactionSerializable8130 = { ...parameters.transaction }

  // Sender authorization.
  if (!transaction.senderAuth) {
    if (!account?.sign)
      throw new BaseError(
        'A sender `account` with raw signing support, or a preset `transaction.senderAuth`, is required.',
      )
    const authenticator =
      parameters.authenticator ?? account.authenticator ?? ecrecoverAuthenticator
    const senderHash = getSenderSignatureHash8130(transaction)
    const signature = await account.sign({ hash: senderHash })
    transaction.senderAuth = transaction.from
      ? // Configured actor: AUTHENTICATOR || data
        // (ecrecover: r || s || v; P-256/WebAuthn: authenticator-specific blob)
        concatHex([authenticator, signature])
      : // EOA path: raw 65-byte signature
        signature
  }

  // Sponsored: bind the payer over the resolved sender.
  if (payer && !transaction.payer)
    transaction.payer = payer.address ?? payer.account.address

  if (transaction.payer && !transaction.payerAuth) {
    if (!payer?.account.sign)
      throw new BaseError(
        'A `payer` signer with raw signing support, or a preset `transaction.payerAuth`, is required for sponsored transactions.',
      )
    const authenticator =
      payer.authenticator ??
      payer.account.authenticator ??
      ecrecoverAuthenticator
    // The payer hash MUST bind to the resolved sender address.
    const from = transaction.from ?? account?.address
    const payerHash = getPayerSignatureHash8130({ ...transaction, from })
    const signature = await payer.account.sign({ hash: payerHash })
    transaction.payerAuth = concatHex([authenticator, signature])
  }

  return serializeTransaction8130(transaction)
}
