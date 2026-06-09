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

export type PayerGasEstimate = {
  gasLimit: Hex
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
}

export type PayerTokenOption = {
  token: Address
  symbol: string
  decimals: number
  /** Canonical phase-0 transfer amount, quoted at the gas cap. */
  maxCost: Hex
  rate: {
    /** Token atomic units... */
    numerator: Hex
    /** ...per this many native wei. */
    denominator: Hex
  }
  rateDisplay?: string | undefined
  rateExpiry: number
}

export type PayerConditions = {
  maxExpiry?: number | undefined
  minExpiry?: number | undefined
  maxGasLimit?: Hex | undefined
  requiredChainId?: Hex | undefined
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
  /** Absolute, seconds. */
  expiry: number
  /** Lifetime in seconds from time of response. */
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

export type SponsorshipOption = {
  type: 'full_sponsorship' | 'conditional'
  payer: Address
  endpoint: string
  sponsor?: PayerSponsor | undefined
  tokenPayment?:
    | {
        token: Address
        tokenSymbol: string
        decimals: number
        estimatedCost: Hex
        rate: { numerator: Hex; denominator: Hex }
        rateDisplay?: string | undefined
        rateExpiry: number
      }
    | undefined
  conditions?: PayerConditions | undefined
  priority?: number | undefined
}

export type GetSponsorshipOptionsParameters = {
  chainId: Hex
  from: Address
  calls: readonly PayerRpcCall[]
  paymentToken?: Address | undefined
  gasLimit?: Hex | undefined
  context?: Record<string, unknown> | undefined
}

export type GetSponsorshipOptionsReturnType = {
  options: readonly SponsorshipOption[]
}

export type PayerChainCapabilities = {
  chainId: Hex
  payer: Address
  endpoint: string
  fullSponsorship: boolean
  acceptedTokens: readonly {
    token: Address
    symbol: string
    decimals: number
  }[]
  methods: readonly string[]
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
