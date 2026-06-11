import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'

/** A call in a payer RPC request (`value`/`data` optional). */
export type PayerRpcCall = {
  to: Address
  value?: Hex | undefined
  data?: Hex | undefined
}

/** Shared balance shape returned by `payer_getTerms` and `payer_getBalance`. */
export type PayerBalance = {
  kind: 'sponsorship' | 'credit'
  /** Remaining amount, atomic units of `asset`. */
  available: string
  /** Total budget or cap, atomic units. */
  limit?: string | undefined
  /** Amount used this period, atomic units. */
  spent?: string | undefined
  /** Token contract address, `"native"`, or ISO-4217 code. */
  asset: string
  symbol?: string | undefined
  decimals?: number | undefined
  /** When a periodic sponsorship budget next refills (seconds). */
  resetAt?: number | undefined
  /** When the balance/credit expires (seconds). */
  expiry?: number | undefined
  /** Source attribution (REQUIRED from aggregators). */
  payer?: Address | undefined
  endpoint?: string | undefined
  name?: string | undefined
}

/**
 * When/how unused gas is refunded. Presence means refunds are offered;
 * absence means none are.
 */
export type RefundPolicy = {
  /** `"in_block"`: settled by the builder in the same block. `"deferred"`: settled later. */
  settlement: 'in_block' | 'deferred'
  /** Deferred only: upper bound in seconds until settled (e.g. 86400 ≈ next day). */
  window?: number | undefined
}

export type PayerGasEstimate = {
  gasLimit: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
  /**
   * Flat gas added on top of `gasLimit` to cover `payer_auth_cost` and payer
   * operational overhead; included in reimbursement.
   * Reimbursement is sized at `(gasLimit + overhead) × maxFeePerGas`.
   */
  overhead?: Hex | undefined
}

export type PayerTokenOption = {
  token: Address
  symbol: string
  decimals: number
  /**
   * Token amount the wallet transfers to `payer` in phase 0, quoted at the
   * gas cap including `gasEstimate.overhead`. Transferring this amount always
   * covers the transaction while terms are valid.
   */
  paymentAmount: Hex
  rate: {
    /** Token atomic units... */
    numerator: Hex
    /** ...per this many native wei. */
    denominator: Hex
  }
  /**
   * Optional: native token price in USD, 6-decimal fixed-point hex integer
   * (e.g. `0x75BCD15` ≈ $1234.56). Shares the same `rateExpiry`.
   */
  usdRate?: Hex | undefined
  rateDisplay?: string | undefined
  /** Relative, seconds from current time. */
  rateExpiry: number
  refund?: RefundPolicy | undefined
}

export type PayerConditions = {
  /** Relative, seconds from current time. */
  maxExpiry?: number | undefined
  /** Relative, seconds from current time. */
  minExpiry?: number | undefined
  maxGasLimit?: Hex | undefined
}

export type PayerSponsor = {
  name: string
  icon?: string | undefined
  reason?: string | undefined
}

export type GetTermsParameters = {
  chainId: Hex
  from: Address
  calls: readonly PayerRpcCall[]
  gasLimit?: Hex | undefined
  preferredTokens?: readonly Address[] | undefined
  /** Opaque app context (e.g. `policyId`) from the `paymasterService` capability. */
  context?: Record<string, unknown> | undefined
}

export type GetTermsReturnType = {
  sponsored: boolean
  /** Relative, seconds from current time. Wallet computes on-chain expiry as `current_time + expiry`. */
  expiry: number
  /** Lifetime of this quote in seconds from time of response. */
  ttl: number
  gasEstimate?: PayerGasEstimate | undefined
  tokenOptions?: readonly PayerTokenOption[] | undefined
  requiredCalls?: readonly PayerRpcCall[] | undefined
  recipient?: Address | undefined
  balance?: PayerBalance | undefined
  conditions?: PayerConditions | undefined
  payer: Address
  endpoint: string
  sponsor?: PayerSponsor | undefined
}

export type TokenCharged = {
  token: Address
  amount: Hex
}

export type SendTransactionParameters = {
  signedTransaction: Hex
  context?: Record<string, unknown> | undefined
}

export type SendTransactionReturnType = {
  transactionHash: Hex
  tokenCharged?: TokenCharged | undefined
}

export type SignTransactionParameters = {
  signedTransaction: Hex
  context?: Record<string, unknown> | undefined
}

export type SignTransactionReturnType = {
  signedTransaction: Hex
  tokenCharged?: TokenCharged | undefined
}

export type FillTransactionParameters = {
  chainId: Hex
  from: Address
  calls: readonly PayerRpcCall[]
  /** Omit to request full sponsorship; set to pay gas in this token. */
  paymentToken?: Address | undefined
  /** Wallet-selected parallel-nonce lane; payer MUST honor if present. */
  nonceKey?: Hex | undefined
  nonceSequence?: Hex | undefined
  gasLimit?: Hex | undefined
  context?: Record<string, unknown> | undefined
}

export type FillTransactionReturnType = {
  /** EIP-8130 transaction with `payer` set, phases built, `payer_auth` empty. */
  unsignedTransaction: Hex
  /** Terms this transaction was filled against; wallet MUST verify before signing. */
  terms: GetTermsReturnType
}

export type GetBalanceParameters = {
  from: Address
  chainId?: Hex | undefined
  /** Aggregator: scope to a single service by address. */
  payer?: Address | undefined
  /** Aggregator: scope to a single service by endpoint URL. */
  endpoint?: string | undefined
  kind?: readonly ('sponsorship' | 'credit')[] | undefined
  context?: Record<string, unknown> | undefined
}

export type GetBalanceReturnType = {
  balances: readonly PayerBalance[]
  ttl: number
}

export type PayerOption = {
  type: 'sponsored' | 'conditional'
  payer: Address
  endpoint: string
  sponsor?: PayerSponsor | undefined
  tokenPayment?:
    | {
        token: Address
        symbol: string
        decimals: number
        estimatedAmount: Hex
        rate: { numerator: Hex; denominator: Hex }
        usdRate?: Hex | undefined
        rateDisplay?: string | undefined
        /** Relative, seconds from current time. */
        rateExpiry: number
      }
    | undefined
  conditions?: PayerConditions | undefined
  priority?: number | undefined
}

export type GetOptionsParameters = {
  chainId: Hex
  from: Address
  calls: readonly PayerRpcCall[]
  paymentToken?: Address | undefined
  gasLimit?: Hex | undefined
  context?: Record<string, unknown> | undefined
}

export type GetOptionsReturnType = {
  options: readonly PayerOption[]
}

export type PayerChainCapabilities = {
  chainId: Hex
  payer: Address
  /** Omitted when served by a node acting as payer (the node's own RPC is the endpoint). */
  endpoint?: string | undefined
  /** Phase 0 token destination; defaults to `payer`. */
  feeRecipient?: Address | undefined
  /** Offers unconditional gas sponsorship, subject to policy. */
  fullSponsorship: boolean
  /**
   * `"unrestricted"`: firm guarantee the payer will not reject based on call
   * content; behaves as a pure financial exchange.
   * `"filtered"`: payer MAY reject based on call content.
   */
  callPolicy: 'unrestricted' | 'filtered'
  acceptedTokens: readonly {
    token: Address
    symbol: string
    decimals: number
  }[]
  /** Authoritative list of `payer_*` methods this responder implements. */
  methods: readonly string[]
  refund?: RefundPolicy | undefined
  conditions?: PayerConditions | undefined
  sponsor?: PayerSponsor | undefined
}

export type GetCapabilitiesParameters = {
  chainId?: Hex | undefined
}

export type GetCapabilitiesReturnType = {
  chains: readonly PayerChainCapabilities[]
  ttl: number
}
