import type { Address } from 'abitype'
import type { Hex } from '../types/misc.js'
import type { PayerErrorCode } from './constants.js'

/** A call in a payer RPC request (`value`/`data` optional). */
export type PayerRpcCall = {
  to: Address
  value?: Hex | undefined
  data?: Hex | undefined
}

/**
 * One axis of a {@link PayerBalance} grant. A single-axis grant has one entry
 * ("$5 of $10"); a compound grant has several ("$0.05 OR 3 txns weekly"). All
 * amounts are unsigned hex, like other on-wire amounts.
 */
export type BalanceLimit = {
  /**
   * `"asset"` → amounts in base units of `asset`. `"count"` → integer counts of
   * transactions / grants (`asset` / `symbol` / `decimals` are unused).
   */
  unit: 'asset' | 'count'
  /** Remaining within this axis. */
  available: Hex
  /** Total budget or cap for this axis, same units as `available`. */
  limit?: Hex | undefined
  /** Total lifetime spent on this axis (if tracked), same units as `available`. */
  spent?: Hex | undefined
  /** REQUIRED when `unit: "asset"`: token address, `"native"`, or ISO-4217 code (e.g. `"USD"`). */
  asset?: string | undefined
  symbol?: string | undefined
  decimals?: number | undefined
}

/**
 * Shared balance shape returned by `payer_getTerms` (inline on a `sponsored`
 * offer) and `payer_getSponsorshipBalance`. The grant's binding axis is the
 * most-depleted `limits` entry (smallest `available / limit` fraction).
 */
export type PayerBalance = {
  kind: 'sponsorship' | 'credit'
  /** ≥1 co-active limits; every limit MUST hold for the next transaction. */
  limits: readonly BalanceLimit[]
  /**
   * Relative seconds the snapshot stays accurate. For a `sponsorship` this is
   * when the periodic budget refills; for a `credit` this is when it lapses to
   * zero. The wallet picks the verb from `kind` ("resets in" / "expires in").
   */
  validFor?: number | undefined
  /** Source attribution (REQUIRED from aggregators): the service's payer address. */
  payer?: Address | undefined
  /** The service's endpoint URL. */
  endpoint?: string | undefined
  /** The service's display info. */
  provider?: PayerProvider | undefined
}

/**
 * Describes when unused gas is refunded to `from`. Its **presence** on a
 * {@link TokenChoice} means refunds are offered for that choice; absence means
 * `paymentAmount` is final. Settlement is an onchain ERC-20 transfer from the
 * payer, gas paid by the payer, within `window` seconds — trust-based, with no
 * onchain recourse.
 */
export type RefundPolicy = {
  /** Upper bound in seconds until the refund is settled (e.g. `86400` ≈ next day). */
  window: number
}

export type PayerGasEstimate = {
  /** Worst-case `gas_limit` across the offers, phase-0 gas included. */
  gasLimit: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
}

export type PayerConditions = {
  /** Upper bound on the transaction's relative `expiry`, in seconds from now. */
  maxExpiry?: number | undefined
  /** Binding cap on the transaction's `gas_limit`. `gasEstimate.gasLimit` MUST be ≤ this when both are present. */
  maxGasLimit?: Hex | undefined
  /**
   * Binding cap in native wei on the transaction's `max_cost`
   * (`gas_limit × max_fee_per_gas`) — the payer's per-tx ceiling. Lets a wallet preflight a cached offer against a fresh
   * intent without round-tripping. The top-level `gasEstimate` MUST satisfy
   * `gasLimit × maxFeePerGas ≤ maxCost` for every selectable offer.
   */
  maxCost?: Hex | undefined
}

/**
 * Display info for the party behind an offer or balance: the sponsor for a
 * `sponsored` offer, the swap/liquidity or payment provider for a `token`
 * offer, the would-be sponsor for a `sponsored_declined` entry. The offer's
 * `kind` gives the role.
 */
export type PayerProvider = {
  name: string
  /** Data URI (RFC-2397), min 96×96px; SVG icons MUST be rendered sandboxed. */
  icon?: string | undefined
}

/**
 * Stable string enum for why sponsorship was declined. Open: payers MAY return
 * their own strings and wallets MUST treat unknown codes as opaque (display
 * `reason` when present, otherwise treat as a generic decline).
 */
export type SponsorshipDeclineCode =
  | 'POLICY_REJECTED'
  | 'SENDER_INELIGIBLE'
  | 'BUDGET_EXHAUSTED'
  | 'SENDER_LIMIT_REACHED'
  | 'COST_EXCEEDS_LIMIT'
  | 'TEMPORARILY_UNAVAILABLE'
  | (string & {})

/**
 * Fields shared by every selectable offer. Recommended gas params live ONCE at
 * the top level (`GetTermsReturnType.gasEstimate`); per-offer binding caps live
 * on `conditions`.
 */
export type BaseOffer = {
  /** Co-signing account for THIS offer; the wallet sets it on the transaction. */
  payer: Address
  /** Co-sign URL for this offer; OPTIONAL, defaults to the called URL. */
  endpoint?: string | undefined
  /**
   * Co-sign methods this offer supports (`payer_sendTransaction`,
   * `payer_signTransaction`). Absent means `payer_sendTransaction` only.
   */
  methods?: readonly string[] | undefined
  /** How long this quote (rates included) stays valid, in seconds. */
  ttl: number
  conditions?: PayerConditions | undefined
  provider?: PayerProvider | undefined
}

/** A selectable full-sponsorship offer (the wallet MAY pick it). */
export type SponsoredOfferSelectable = BaseOffer & {
  kind: 'sponsored'
  /** Present when this sponsorship draws from an allowance/credit; absent = fully paid by sponsor. */
  balance?: PayerBalance | undefined
}

/**
 * A declined sponsorship entry: informational only, never selectable. A sibling
 * discriminant — consumers branch on `kind === "sponsored_declined"` directly.
 */
export type SponsoredOfferDeclined = {
  kind: 'sponsored_declined'
  code: SponsorshipDeclineCode
  reason?: string | undefined
  balance?: PayerBalance | undefined
  /**
   * Cost-cap diagnostic, present (and only meaningful) when `code` is
   * `COST_EXCEEDS_LIMIT`.
   */
  cost?: PayerCostDiagnostic | undefined
  provider?: PayerProvider | undefined
}

/** Diagnostic for `COST_EXCEEDS_LIMIT`. Both values are native wei. */
export type PayerCostDiagnostic = {
  /** `max_cost` the payer estimated for this intent at current gas prices. */
  estimated: Hex
  /** Per-transaction ceiling. */
  limit: Hex
}

/** A `sponsored` entry: either a selectable offer or a declined sibling. */
export type SponsoredOffer = SponsoredOfferSelectable | SponsoredOfferDeclined

/** One accepted token under a {@link TokenOffer}'s shared terms. */
export type TokenChoice = {
  /** ERC-20 address, or `"native"` for payment by value transfer. */
  token: Address | 'native'
  symbol: string
  decimals: number
  /**
   * The required amount at the response's top-level `gasEstimate`. Present
   * exactly when `gasEstimate` is; otherwise the wallet prices from `rate`
   * at its own gas.
   */
  paymentAmount?: Hex | undefined
  /** Optional phase-0 destination; defaults to the offer's `payer`. Per-token by design. */
  feeRecipient?: Address | undefined
  /**
   * Binding price as a WAD: token atomic units per 1e18 native wei. The phase-0
   * credit must cover `ceil(max_cost × rate / 1e18)` at the transaction's own
   * `max_cost` (`gas_limit × max_fee_per_gas`).
   */
  rate: Hex
  /** Advisory gas the default phase-0 payment adds to `gas_limit`, already included in `gasEstimate`. */
  paymentGas?: Hex | undefined
  /**
   * Optional: one whole `token`'s display price in the response's
   * `fiatCurrency`, as a WAD (e.g. `0xDE0B6B3A7640000` = 1.00). Fiat cost =
   * `amount × fiatRate / 10^decimals`, itself a WAD. Shares the offer's `ttl`.
   */
  fiatRate?: Hex | undefined
  refund?: RefundPolicy | undefined
}

/**
 * A token-payment offer: a single co-signer accepting one or more tokens for
 * gas under shared terms. Per-token differences live on each {@link TokenChoice}.
 * Entries MAY share `token` for distinct terms, but their phase-0
 * `(token, paymentAmount, feeRecipient)` fingerprints MUST be distinct across
 * every token construction sharing this offer's `payer` in the response.
 */
export type TokenOffer = BaseOffer & {
  kind: 'token'
  /** ≥1 accepted tokens. */
  tokens: readonly TokenChoice[]
  /**
   * What phase-0 constructions this offer's payer accepts, and how it verifies
   * them. OPTIONAL; absent is treated as `"transfer"`.
   *
   * - `"transfer"`: phase 0 MUST be the single canonical
   *   `IERC20.transfer(recipient, amount)`, or for `"native"` a single value
   *   transfer to `recipient` — verified by inspection, no simulation, no
   *   approvals. Any other phase-0 shape is rejected.
   * - `"any"`: the payer pins only the OUTCOME (`recipient` credited exactly
   *   `paymentAmount` of `token` by the end of phase 0) and accepts any calls
   *   that achieve it (`transferFrom`, session-key module calls, pool
   *   withdrawal + split, other token standards), verifying the net credit by
   *   simulation/trace.
   */
  paymentMode?: 'transfer' | 'any' | undefined
}

/** A payment offer for an intent's gas: full sponsorship, decline, or token payment. */
export type PaymentOption = SponsoredOffer | TokenOffer

export type GetTermsParameters = {
  chainId: Hex
  from: Address
  calls: readonly PayerRpcCall[]
  /**
   * The wallet's gas for the user calls, WITHOUT phase 0. The payer adds the
   * phase-0 gas itself (`paymentGas`).
   */
  gasLimit?: Hex | undefined
  /** Ordering hint, not a filter: the payer SHOULD list these first in `tokens`. */
  preferredTokens?: readonly (Address | 'native')[] | undefined
  /**
   * OPTIONAL ISO-4217 code (e.g. `"USD"`, `"EUR"`) the wallet would like
   * `fiatRate`s quoted in. The payer SHOULD honor it and MUST echo the currency
   * it used in `GetTermsReturnType.fiatCurrency`. Absent means no preference.
   */
  fiatCurrency?: string | undefined
  /** Opaque app context (e.g. `policyId`) from the `paymasterService` capability. */
  context?: Record<string, unknown> | undefined
}

export type GetTermsReturnType = {
  /**
   * Payment offers for this intent, best-first. An empty array means the payer
   * has nothing to offer.
   */
  options: readonly PaymentOption[]
  /**
   * RECOMMENDED gas params shared by every offer in this response. The wallet
   * uses these to size the transaction; each offer's binding caps live on its
   * `conditions`. A token offer's `paymentAmount` is quoted against this
   * estimate's worst-case gas cap.
   */
  gasEstimate?: PayerGasEstimate | undefined
  /**
   * ISO-4217 code every `TokenChoice.fiatRate` in this response is quoted in.
   * Echoes the requested `GetTermsParameters.fiatCurrency` when honored, else
   * the currency the payer used (conventionally `"USD"`). REQUIRED whenever any
   * offer carries a `fiatRate`.
   */
  fiatCurrency?: string | undefined
}

/** Params for the `payer_sendTransaction` RPC method (payer co-signs + submits). */
export type PayerSendTransactionParameters = {
  /** The sender-signed transaction, with `payer` set and `payer_auth` empty. */
  transaction: Hex
  context?: Record<string, unknown> | undefined
}

/** Return of the `payer_sendTransaction` RPC method. */
export type PayerSendTransactionReturnType = {
  transactionHash: Hex
}

/** Params for the `payer_signTransaction` RPC method (payer authorizes only). */
export type PayerSignTransactionParameters = {
  /**
   * The built transaction, with `payer` set and `payer_auth` empty. It MAY
   * already carry `sender_auth`: the payer's signature is independent of it.
   */
  transaction: Hex
  context?: Record<string, unknown> | undefined
}

/** Return of the `payer_signTransaction` RPC method. */
export type PayerSignTransactionReturnType = {
  /** The payer's `payer_auth` bytes for this transaction; opaque to the wallet. */
  payerAuth: Hex
}

export type GetSponsorshipBalanceParameters = {
  from: Address
  /** Optional executionchain filter. */
  chainId?: Hex | undefined
  /** Aggregator: scope to a single service by address. */
  payer?: Address | undefined
  /** Aggregator: scope to a single service by endpoint URL. */
  endpoint?: string | undefined
  kinds?: readonly ('sponsorship' | 'credit')[] | undefined
  context?: Record<string, unknown> | undefined
}

export type GetSponsorshipBalanceReturnType = {
  balances: readonly PayerBalance[]
  /** How long this snapshot may be cached, in seconds. */
  ttl: number
}

/**
 * The corrected phase-0 transfer a payer would accept now, carried on a
 * `PAYMENT_INSUFFICIENT` rejection. The wallet re-signs phase 0 with these
 * values and resubmits WITHOUT calling `payer_getTerms` again — the token (and
 * by default `feeRecipient`) match the construction already built; typically
 * only `paymentAmount` changes.
 */
export type PayerRequote = {
  token: Address | 'native'
  /** The sufficient amount now. */
  paymentAmount: Hex
  /** Defaults to the offer's `payer`. */
  feeRecipient?: Address | undefined
  /** WAD rate the corrected amount was priced at (see {@link TokenChoice.rate}). */
  rate?: Hex | undefined
  /** Relative seconds this corrected amount holds. */
  ttl?: number | undefined
}

/**
 * The `error.data` payload on a `-32000` {@link payerRejectedCode}
 * (`PAYER_REJECTED`) error from `payer_sendTransaction` /
 * `payer_signTransaction`. Consumers MUST branch on the string `code` and MAY
 * ignore the numeric JSON-RPC code (a single envelope).
 */
export type PayerRejectedData = {
  code: PayerErrorCode
  /** Human-readable detail for display/logs. */
  reason?: string | undefined
  /** Context for `BUDGET_EXHAUSTED` / `SENDER_LIMIT_REACHED` (its `validFor` says when to retry). */
  balance?: PayerBalance | undefined
  /** Present (and only meaningful) for `COST_EXCEEDS_LIMIT`. */
  cost?: PayerCostDiagnostic | undefined
  /**
   * Present (SHOULD) for `GAS_TOO_LOW`: the smallest `gasLimit` the payer's
   * simulation needs for the calls to succeed. The wallet raises `gasLimit` to
   * at least this, re-signs, and resubmits (bounded above by
   * `conditions.maxGasLimit`).
   */
  minGasLimit?: Hex | undefined
  /** Present (SHOULD) for `PAYMENT_INSUFFICIENT`: the corrected phase-0 transfer. */
  requote?: PayerRequote | undefined
  /** Present (SHOULD) for `SENDER_BALANCE_INSUFFICIENT`: how far the sender is short. */
  /** Present (SHOULD) for `EXECUTION_REVERTED`. */
  revert?:
    | {
        /** 0 = payment phase, 1 = user calls, ... */
        phase: number
        /** Decoded revert reason, when available. */
        reason?: string | undefined
        /** Raw revert return data. */
        data?: Hex | undefined
      }
    | undefined
  shortfall?:
    | {
        /** The asset the sender is short of. */
        token: Address | 'native'
        /** Amount the transaction needs, in the asset's base units. */
        required: Hex
        /** The sender's balance at simulation. */
        available: Hex
      }
    | undefined
  /**
   * Fresh offers the wallet MAY pick from instead of calling `payer_getTerms`
   * again. Each `paymentAmount` is priced at the rejected transaction's `max_cost`.
   */
  options?: readonly PaymentOption[] | undefined
  /** REQUIRED when any offer in `options` carries a `fiatRate`. */
  fiatCurrency?: string | undefined
}
