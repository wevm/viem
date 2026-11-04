import type { Address } from 'abitype'
import type { LocalAccount } from '../../accounts/types.js'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import { type ConcatHexErrorType, concatHex } from '../../utils/data/concat.js'
import { k1Authenticator, openPayer } from '../constants.js'
import type {
  AaPayer,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import {
  type GetPayerSignatureHashErrorType,
  type GetSenderSignatureHashErrorType,
  getPayerSignatureHash,
  getSenderSignatureHash,
} from './hashTransaction.js'
import { recoverSenderAddress } from './recoverSender.js'
import {
  type SerializeTransactionErrorType,
  serializeTransaction,
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
   * `K1_AUTHENTICATOR` (native secp256k1). Other authenticators require the
   * EIP-8130 Keystore integration (`viem/experimental/keystore`).
   */
  authenticator?: Address | undefined
}

export type SignTransactionParameters = {
  transaction: TransactionSerializable8130
  /**
   * Sender signer. Used to produce `sender_auth` over the sender signature
   * hash. Not required if `transaction.senderAuth` is already set.
   *
   * - Recovered sender (`transaction.from` unset): `sender_auth` is the raw
   *   65-byte signature and the recovered address is the sender.
   * - Named sender (`transaction.from` set): `sender_auth` is
   *   `K1_AUTHENTICATOR || signature`.
   */
  account?: Signer | undefined
  /**
   * Authenticator for a named sender's `auth` blob. Defaults to
   * `account.authenticator`, then `K1_AUTHENTICATOR`.
   */
  authenticator?: Address | undefined
  /**
   * Payer signer for sponsored transactions. Produces `payer_auth` over the
   * payer signature hash: `authenticator || signature` for a named payer, or
   * the raw 65-byte signature in open mode (`payer: openPayer`). When
   * `transaction.senderAuth` is preset and `transaction.from` is empty, the
   * sender is recovered so the payer signature binds to it.
   */
  payer?:
    | {
        account: Signer
        /**
         * The `payer` wire value. Defaults to the payer account's address;
         * pass `openPayer` for open mode.
         */
        address?: AaPayer | undefined
        /**
         * Authenticator for the payer's `auth` blob. Defaults to
         * `account.authenticator`, then `ECRECOVER_AUTHENTICATOR`.
         */
        authenticator?: Address | undefined
      }
    | undefined
}

export type SignTransactionErrorType =
  | GetSenderSignatureHashErrorType
  | GetPayerSignatureHashErrorType
  | SerializeTransactionErrorType
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
export async function signTransaction(
  parameters: SignTransactionParameters,
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
      parameters.authenticator ?? account.authenticator ?? k1Authenticator
    const senderHash = getSenderSignatureHash(transaction)
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

  if (transaction.payer && !transaction.payerAuth && payer) {
    if (!payer.account.sign)
      throw new BaseError(
        'A `payer` signer with raw signing support, or a preset `transaction.payerAuth`, is required for sponsored transactions.',
      )
    // The payer hash MUST bind to the resolved sender address.
    const from =
      transaction.from ??
      account?.address ??
      (await recoverSenderAddress({ transaction }))
    const openMode = transaction.payer === openPayer
    if (openMode) {
      const authenticator = payer.authenticator ?? payer.account.authenticator
      if (authenticator && authenticator.toLowerCase() !== k1Authenticator)
        throw new BaseError(
          `Open payer mode requires a secp256k1 payer signer (the payer is recovered from a raw signature), but the payer uses authenticator ${authenticator}. Name the payer address instead.`,
        )
    }
    const payerHash = getPayerSignatureHash({ ...transaction, from })
    const signature = await payer.account.sign({ hash: payerHash })
    if (openMode)
      // Open mode: the payer is recovered from a raw 65-byte signature.
      transaction.payerAuth = signature
    else {
      const authenticator =
        payer.authenticator ?? payer.account.authenticator ?? k1Authenticator
      transaction.payerAuth = concatHex([authenticator, signature])
    }
  }

  return serializeTransaction(transaction)
}
