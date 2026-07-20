import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
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
  /** Source attribution (REQUIRED from aggregators): the service address. */
  payer?: Address | undefined
  endpoint?: string | undefined
  name?: string | undefined
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
  /**
   * Gas for this offer's calls. A token-payment offer includes its phase-0
   * transfer in the budget, so its `gasLimit` exceeds an equivalent sponsored
   * offer's.
   */
  gasLimit: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
}

export type PayerConditions = {
  /** Upper bound on the transaction's relative `expiry`, in seconds from now. */
  maxExpiry?: number | undefined
  /** Binding gas cap. `gasEstimate.gasLimit` MUST be ≤ this when both are present. */
  maxGasLimit?: Hex | undefined
  /**
   * Binding cost cap in native wei on `gasLimit × maxFeePerGas` — the payer's
   * per-tx ceiling. Lets a wallet preflight a cached offer against a fresh
   * intent without round-tripping. The top-level `gasEstimate` MUST satisfy
   * `gasLimit × maxFeePerGas ≤ maxCost` for every selectable offer.
   */
  maxCost?: Hex | undefined
}

/**
 * Display info for the party behind an offer: the sponsor for a `sponsored`
 * offer, the swap/liquidity or payment provider for a `token` offer, the
 * would-be sponsor for a `sponsored_declined` entry. The offer's `kind` gives
 * the role.
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
  | 'GAS_EXCEEDS_LIMIT'
  | 'TEMPORARILY_UNAVAILABLE'
  // biome-ignore lint/suspicious/noExplicitAny: keep the well-known union while staying open to custom strings
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
   * Additive list of OPTIONAL offer-scoped `payer_*` methods beyond the
   * always-implied required pair (`payer_getTerms`, `payer_sendTransaction`) —
   * chiefly `payer_signTransaction`. The required pair MUST NOT be restated.
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
   * `GAS_EXCEEDS_LIMIT`. Both values are native wei.
   */
  gas?:
    | {
        /** Wei cost the payer estimated for this intent at current gas prices. */
        estimatedCost: Hex
        /** Per-tx ceiling in wei. */
        maxCost: Hex
      }
    | undefined
  provider?: PayerProvider | undefined
}

/** A `sponsored` entry: either a selectable offer or a declined sibling. */
export type SponsoredOffer = SponsoredOfferSelectable | SponsoredOfferDeclined

/** One accepted token under a {@link TokenPaymentOffer}'s shared terms. */
export type TokenChoice = {
  token: Address
  symbol: string
  decimals: number
  /**
   * Token amount the wallet transfers in phase 0 to `feeRecipient` (or the
   * offer's `payer` when absent), quoted against the response's top-level
   * `gasEstimate` (worst-case gas cap). Part of the co-sign fingerprint.
   */
  paymentAmount: Hex
  /** Optional phase-0 destination; defaults to the offer's `payer`. Per-token by design. */
  feeRecipient?: Address | undefined
  rate: {
    /** Token atomic units... */
    numerator: Hex
    /** ...per this many native wei. */
    denominator: Hex
  }
  /**
   * Optional: the PAYMENT TOKEN's price in the response's `fiatCurrency`,
   * 6-decimal fixed-point hex integer (e.g. `0xF4240` = 1.00 for a USD
   * stablecoin priced in USD). Quoted on `token`, so fiat cost =
   * `paymentAmount × fiatRate / (10^decimals × 10^6)`. Shares the offer's `ttl`.
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
export type TokenPaymentOffer = BaseOffer & {
  kind: 'token'
  /** ≥1 accepted tokens. */
  tokens: readonly TokenChoice[]
  /**
   * What phase-0 constructions this offer's payer accepts, and how it verifies
   * them. OPTIONAL; absent is treated as `"transfer"`.
   *
   * - `"transfer"`: phase 0 MUST be the single canonical
   *   `IERC20.transfer(recipient, paymentAmount)` — verified by inspection, no
   *   simulation, no approvals. Any other phase-0 shape is rejected.
   * - `"any"`: the payer pins only the OUTCOME (`recipient` credited exactly
   *   `paymentAmount` of `token` by the end of phase 0) and accepts any calls
   *   that achieve it (`transferFrom`, session-key module calls, pool
   *   withdrawal + split, other token standards), verifying the net credit by
   *   simulation/trace.
   */
  paymentMode?: 'transfer' | 'any' | undefined
}

/** A payment offer for an intent's gas: full sponsorship, decline, or token payment. */
export type PaymentOption = SponsoredOffer | TokenPaymentOffer

export type GetTermsParameters = {
  chainId: Hex
  from: Address
  calls: readonly PayerRpcCall[]
  gasLimit?: Hex | undefined
  preferredTokens?: readonly Address[] | undefined
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

export type TokenCharged = {
  token: Address
  /** Gross phase-0 transfer (the selected choice's `paymentAmount`). */
  amount: Hex
  /** Payer's estimate of the refund to settle later, when a `refund` applies. */
  estimatedRefund?: Hex | undefined
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

export type GetSponsorshipBalanceParameters = {
  from: Address
  /** Optional executionchain filter. */
  chainId?: Hex | undefined
  /** Aggregator: scope to a single service by address. */
  payer?: Address | undefined
  /** Aggregator: scope to a single service by endpoint URL. */
  endpoint?: string | undefined
  kind?: readonly ('sponsorship' | 'credit')[] | undefined
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
  token: Address
  /** The sufficient amount now. */
  paymentAmount: Hex
  /** Defaults to the offer's `payer`. */
  feeRecipient?: Address | undefined
  rate?: { numerator: Hex; denominator: Hex } | undefined
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
  /** Present (and only meaningful) for `GAS_EXCEEDS_LIMIT`. Both values native wei. */
  gas?:
    | {
        /** Wei cost the payer estimated for this intent at current gas prices. */
        estimatedCost: Hex
        /** Per-tx ceiling in wei. */
        maxCost: Hex
      }
    | undefined
  /**
   * Present (SHOULD) for `GAS_TOO_LOW`: the smallest `gasLimit` the payer's
   * simulation needs for the calls to succeed. The wallet raises `gasLimit` to
   * at least this, re-signs, and resubmits (bounded above by
   * `conditions.maxGasLimit`).
   */
  minGasLimit?: Hex | undefined
  /** Present (SHOULD) for `PAYMENT_INSUFFICIENT`: the corrected phase-0 transfer. */
  requote?: PayerRequote | undefined
}
