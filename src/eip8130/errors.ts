import { BaseError } from '../errors/base.js'

export type TransactionExpiredErrorType = TransactionExpiredError & {
  name: 'TransactionExpiredError'
}

/**
 * Thrown while waiting on a nonce-free (expiring) EIP-8130 transaction when the
 * chain's latest block timestamp passes the transaction's `validBefore` before a
 * receipt is observed. The transaction can no longer be included — it has been
 * (or will be) dropped from the mempool — so waiting further is pointless.
 *
 * Distinct from a plain wait timeout: this is a definitive terminal state, not
 * "we gave up early". Callers can catch this to resubmit with a fresh
 * `validBefore`.
 */
export class TransactionExpiredError extends BaseError {
  override name = 'TransactionExpiredError'
  constructor({
    hash,
    validBefore,
    blockTimestamp,
  }: {
    hash: `0x${string}`
    /** Upper validity bound the tx was signed with (unix ms). */
    validBefore: bigint
    /** Latest block timestamp (unix seconds). */
    blockTimestamp: bigint
  }) {
    super(
      `Transaction \`${hash}\` expired before landing: \`validBefore\` ${validBefore} (unix ms) passed (latest block timestamp ${blockTimestamp}s).`,
      {
        metaMessages: [
          'Nonce-free (expiring) transactions are only valid until their `validBefore`; once the block timestamp passes it the tx is dropped and can never be mined.',
          'Resubmit with a fresh `validBefore` (e.g. `nonce.nonceless({ expiresIn })`).',
        ],
      },
    )
  }
}
