/**
 * ERC-8168 payer-service JSON-RPC error codes. Payer services use these when
 * rejecting requests; responses SHOULD include actionable `data`.
 */
export const payerErrorCode = {
  /** Malformed or invalid EIP-8130 transaction. */
  invalidTransaction: -32600,
  /** Token in the phase-0 transfer not accepted by this payer. */
  unsupportedToken: -32601,
  /** Terms from `payer_getTerms` have expired; re-request. */
  rateExpired: -32602,
  /** Token transfer amount in phase 0 is below the required cost. */
  paymentInsufficient: -32603,
  /** Transaction expiry does not satisfy payer conditions. */
  expiryOutOfBounds: -32604,
  /** Payer policy rejected this transaction. */
  policyRejected: -32605,
  /** Payer lacks ETH to cover gas. */
  payerBalanceInsufficient: -32606,
  /** Sender is blocklisted for the specified token. */
  senderBlocklisted: -32607,
  /** Sender's sponsorship budget or prepaid credit is depleted. */
  balanceExhausted: -32608,
} as const

export type PayerErrorCode =
  (typeof payerErrorCode)[keyof typeof payerErrorCode]
