/**
 * ERC-8168 payer-service JSON-RPC error codes. These occupy the `-32000` to
 * `-32099` range that JSON-RPC 2.0 reserves for implementation-defined server
 * errors. They MUST NOT reuse the codes reserved for protocol errors
 * (`-32600` Invalid Request, `-32601` Method not found, `-32602` Invalid
 * params, `-32603` Internal error, `-32700` Parse error).
 *
 * Payer services use these when rejecting requests; responses SHOULD include
 * actionable `data`.
 */
export const payerErrorCode = {
  /** Malformed or invalid EIP-8130 transaction. */
  invalidTransaction: -32001,
  /** Token in the phase-0 transfer not accepted by this payer. */
  unsupportedToken: -32002,
  /** Terms from `payer_getTerms` have expired; re-request. */
  rateExpired: -32003,
  /** Token transfer amount in phase 0 is below the required cost. */
  paymentInsufficient: -32004,
  /** Transaction expiry does not satisfy payer conditions. */
  expiryOutOfBounds: -32005,
  /** Payer policy rejected this transaction. */
  policyRejected: -32006,
  /** Payer lacks ETH to cover gas. */
  payerBalanceInsufficient: -32007,
  /** Sender is blocklisted for the specified token. */
  senderBlocklisted: -32008,
  /** Sender's sponsorship budget or prepaid credit is depleted. */
  balanceExhausted: -32009,
} as const

export type PayerErrorCode =
  (typeof payerErrorCode)[keyof typeof payerErrorCode]
