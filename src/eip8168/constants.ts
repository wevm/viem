/**
 * Single JSON-RPC error code for every actionable payer rejection from
 * `payer_sendTransaction` / `payer_signTransaction`: `PAYER_REJECTED`. It sits
 * in the `-32000`..`-32099` range JSON-RPC 2.0 reserves for implementation
 * server errors, and MUST NOT reuse the protocol codes (`-32600` Invalid
 * Request, `-32601` Method not found, `-32602` Invalid params, `-32603` Internal
 * error, `-32700` Parse error).
 *
 * The machine-readable reason rides in `error.data.code` as a
 * {@link PayerErrorCode} string; `error.data` SHOULD carry actionable context.
 * `payer_getTerms` never returns this error — a declined sponsorship rides on a
 * `sponsored_declined` option carrying a {@link SponsorshipDeclineCode} instead.
 */
export const payerRejectedCode = -32000 as const

/**
 * Well-known `error.data.code` strings for a `PAYER_REJECTED` JSON-RPC error.
 * A superset of {@link sponsorshipDeclineCode}: the decline vocabulary plus the
 * co-sign-time validation failures. Open — payers MAY return their own strings
 * and wallets MUST treat unknown codes as a generic failure (showing any
 * human-readable `error.message`).
 */
export const payerErrorCode = {
  /** Calls or contracts rejected by this sponsor's policy for this intent. */
  policyRejected: 'POLICY_REJECTED',
  /** Sender rejected entirely (blocklisted, or missing a required attestation). */
  senderIneligible: 'SENDER_INELIGIBLE',
  /** Sender's sponsorship budget or prepaid credit is depleted; check `balance.validFor`. */
  budgetExhausted: 'BUDGET_EXHAUSTED',
  /** Per-sender cap reached (tx count or USD); check `balance.validFor`. */
  senderLimitReached: 'SENDER_LIMIT_REACHED',
  /** Gas price exceeds the sponsor's per-tx cost ceiling; retry when gas drops. */
  gasExceedsLimit: 'GAS_EXCEEDS_LIMIT',
  /** Payer is degraded (e.g. rate feed down); retry shortly. */
  temporarilyUnavailable: 'TEMPORARILY_UNAVAILABLE',
  /** Malformed or invalid EIP-8130 transaction. */
  invalidTransaction: 'INVALID_TRANSACTION',
  /** Token in the phase-0 transfer not accepted by this payer. */
  unsupportedToken: 'UNSUPPORTED_TOKEN',
  /** Phase-0 transfer no longer covers the cost (gas/rate moved, or the quote went stale); SHOULD carry a `requote`. */
  paymentInsufficient: 'PAYMENT_INSUFFICIENT',
  /** Transaction `gasLimit` is below what the calls need to execute; SHOULD carry a `minGasLimit`. */
  gasTooLow: 'GAS_TOO_LOW',
  /** Transaction `expiry` does not satisfy `conditions.maxExpiry`. */
  expiryOutOfBounds: 'EXPIRY_OUT_OF_BOUNDS',
  /** Payer lacks ETH to cover gas at the protocol level. */
  payerBalanceInsufficient: 'PAYER_BALANCE_INSUFFICIENT',
} as const

export type PayerErrorCode =
  | (typeof payerErrorCode)[keyof typeof payerErrorCode]
  | (string & {})

/**
 * The subset of {@link payerErrorCode} a payer may surface pre-signature, on a
 * `sponsored_declined` option from `payer_getTerms`. The same string reappears
 * as `error.data.code` if the equivalent co-sign call is attempted and fails.
 */
export const sponsorshipDeclineCode = {
  policyRejected: 'POLICY_REJECTED',
  senderIneligible: 'SENDER_INELIGIBLE',
  budgetExhausted: 'BUDGET_EXHAUSTED',
  senderLimitReached: 'SENDER_LIMIT_REACHED',
  gasExceedsLimit: 'GAS_EXCEEDS_LIMIT',
  temporarilyUnavailable: 'TEMPORARILY_UNAVAILABLE',
} as const
