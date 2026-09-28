import type { Address } from 'abitype'
import {
  type FundingPolicy,
  type FundingRequirement,
  FundingSource,
  type KeyAuthorization,
  type TransactionRequest,
} from 'ox/tempo'
import type { Tokens } from '../tokens/defineToken.js'
import { tokens } from '../tokens/sets.js'
import type {
  EIP1193RequestOptions,
  PublicRpcSchema,
} from '../types/eip1193.js'
import type { Hex } from '../types/misc.js'
import type { UnionOmit } from '../types/utils.js'
import * as Addresses from './Addresses.js'
import type * as internal from './internal/funding.js'
import * as Funding from './internal/relay/funding.js'
import * as Request from './internal/relay/request.js'
import type * as Store from './Store.js'
import type { TransactionRequestTempo, TransactionRpc } from './Transaction.js'

/** An unsigned funding requirement whose omitted fields are resolved before signing. */
export type Requirement = internal.FundingRequirementIntent

/** Funding intent at the unsigned RPC boundary. */
export type RequirementRpc = FundingRequirement.RequestRpc

/** Funding relay RPC methods. */
export type RpcSchema = [
  {
    Method: 'funding_registerPolicyRules'
    Parameters: [{ chainId: Hex; rules: Hex }]
    ReturnType: { rulesHash: Hex }
  },
  {
    Method: 'eth_fillKeyAuthorization'
    Parameters: [
      {
        account: Address
        keyAuthorization: UnionOmit<
          KeyAuthorization.UnsignedRpc,
          'fundingPolicy'
        > & {
          fundingPolicy?: true | FundingPolicy.Rpc | undefined
        }
      },
    ]
    ReturnType: { keyAuthorization: KeyAuthorization.UnsignedRpc }
  },
]

/**
 * Infers requested token balances and resolves funding sources and access key policy rules for fills, calls, and gas estimates.
 * Explicit sources are preserved; omitted access key rules are loaded and verified.
 *
 * @example
 * ```ts
 * import { Addresses, Funding, FundingSource } from 'viem/tempo'
 *
 * const handleRequest = Funding.handleRequest(next, {
 *   getRoute: ({ chainId, token }) => {
 *     if (chainId !== 42431 || token !== Addresses.pathUsd) return undefined
 *     return {
 *       sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
 *     }
 *   },
 * })
 * ```
 *
 * @param next - Downstream RPC handler.
 * @param parameters - Discovery routes and policy rules storage.
 * @returns The funding-aware RPC handler.
 */
export function handleRequest(
  next: handleRequest.Handler,
  parameters: handleRequest.Parameters = {},
): handleRequest.Handler {
  return Request.compose(next, { plugins: [Funding.create(parameters)] })
}

export declare namespace handleRequest {
  /** RPC request and additional positional parameters. */
  export type Request = {
    method: string
    params?: readonly unknown[] | undefined
  }

  /** Downstream handler, shared by client transports and relays. */
  export type Handler = (
    request: Request,
    options?: EIP1193RequestOptions & { chainId?: number | undefined },
  ) => Promise<unknown>

  /** Ordered configurations and aggregate slippage for one output token. */
  export type Route = {
    /** Aggregate slippage in basis points. Defaults to zero. */
    slippageBps?: number | undefined
    /** Ordered source configurations, not execution data from another request. */
    sources: readonly FundingSource.Source[]
  }

  /** Funding discovery and policy rules storage. */
  export type Parameters = {
    /** Additional TIP-20 output tokens to seed when inferring requirements. The shared relay token resolver supplies known candidates. */
    tokens?: readonly Address[] | undefined
    /** Default policy selected only for `fundingPolicy: true`. */
    policyId?: bigint | undefined
    /** Fallback rules when neither the request nor the store supplies them. Verified against the current onchain commitment before use. */
    policyRules?: FundingPolicy.Rules | undefined
    /** Verified rules cache, scoped by chain, contract, and commitment. Defaults to an in-memory store. */
    store?: Store.Store | undefined
    /** Resolves source configurations for a chain and output token. Defaults to known same-currency Native DEX inputs on mainnet, testnet, and localnet. */
    getRoute?:
      | ((context: {
          /** Chain selected for discovery and transaction filling. */
          chainId: number
          /** Checksummed output token address. */
          token: Address
          /** Unsigned RPC transaction. Read `from` for the funding account address. */
          transaction: Readonly<Transaction>
        }) => Route | undefined | Promise<Route | undefined>)
      | undefined
  }

  /** Unsigned RPC transaction fields used by funding resolution. */
  export type Transaction = Omit<TransactionRequest.Rpc, 'requireFunds'> &
    Partial<Pick<TransactionRpc, 'feePayerSignature' | 'signature'>> &
    Pick<TransactionRequestTempo, 'signatures'> & {
      /** Access key used to execute the transaction. */
      keyId?: Address | undefined
      /** Funding requirements to resolve before filling. Set true to infer them from simulation. */
      requireFunds?: true | readonly RequirementRpc[] | undefined
    }

  /** Existing node fill response, including the filled RPC transaction. */
  export type Result = Omit<
    Extract<
      PublicRpcSchema[number],
      { Method: 'eth_fillTransaction' }
    >['ReturnType'],
    'tx'
  > & {
    /** Filled Tempo transaction. */
    tx: TransactionRpc
  }
}

/** Selects known parity inputs without assuming that they have balances or liquidity. @internal */
export function defaultRoute({
  chainId,
  token,
}: {
  chainId: number
  token: Address
}): handleRequest.Route | undefined {
  // Localnet deploys the four standard test tokens.
  const tokenChainId = chainId === 1337 ? 42431 : chainId
  if (tokenChainId !== 4217 && tokenChainId !== 42431) return undefined

  const known: Tokens =
    chainId === 1337
      ? tokens.tempo.filter((entry) => {
          const address = (entry.addresses as Record<number, Address>)[42431]
          return [
            Addresses.pathUsd,
            Addresses.alphaUsd,
            Addresses.betaUsd,
            Addresses.thetaUsd,
          ].some((token) => token === address)
        })
      : tokens.tempo
  const output = known.find(
    (entry) =>
      entry.addresses[tokenChainId]?.toLowerCase() === token.toLowerCase(),
  )
  if (!output?.currency) return undefined

  return {
    sources: known.flatMap((entry) => {
      const tokenIn = entry.addresses[tokenChainId]
      if (
        !tokenIn ||
        entry.currency !== output.currency ||
        tokenIn.toLowerCase() === token.toLowerCase()
      )
        return []
      return [FundingSource.dex({ tokenIn })]
    }),
  }
}
