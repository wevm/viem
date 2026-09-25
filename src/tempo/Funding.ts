import type { Address } from 'abitype'
import * as Address_ from 'ox/Address'
import * as RpcResponse from 'ox/RpcResponse'
import {
  FundingRequirement,
  FundingSource,
  type TransactionRequest,
} from 'ox/tempo'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import type { Tokens } from '../tokens/defineToken.js'
import { tokens } from '../tokens/sets.js'
import type {
  EIP1193RequestOptions,
  PublicRpcSchema,
} from '../types/eip1193.js'
import * as Addresses from './Addresses.js'
import { discover } from './actions/funding.js'
import type { FundingRequirementIntent } from './internal/requireFunds.js'
import type { TransactionRequestTempo, TransactionRpc } from './Transaction.js'

/** An unsigned funding requirement whose sources may be discovered by a relay. */
export type Requirement = FundingRequirementIntent

/** Funding intent at the unsigned RPC boundary. */
export type RequirementRpc = Omit<FundingRequirement.Rpc, 'sources'> & {
  /** Omission requests discovery; an empty array is explicit. */
  sources?: FundingRequirement.Rpc['sources'] | undefined
}

/**
 * Resolves owner-authorized funding sources before downstream transaction filling.
 * Explicit sources are preserved. Automatic inference and access key resolution are not supported.
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
 * @param parameters - Owner discovery routes.
 * @returns The funding-aware RPC handler.
 */
export function handleRequest(
  next: handleRequest.Handler,
  parameters: handleRequest.Parameters = {},
): handleRequest.Handler {
  return async (request, options) => {
    if (request.method !== 'eth_fillTransaction') return next(request, options)

    const [transaction, ...rest] = (request.params ?? []) as [
      handleRequest.Transaction,
      ...unknown[],
    ]

    if (
      transaction?.requireFunds === undefined ||
      (Array.isArray(transaction.requireFunds) &&
        !transaction.requireFunds.length)
    )
      return next(request, options)

    if (!Array.isArray(transaction.requireFunds))
      throw new RpcResponse.InvalidParamsError({
        message:
          'Supply `requireFunds` with explicit `token` and `amount`; automatic inference is not supported yet.',
      })

    if (
      transaction.signature != null ||
      transaction.feePayerSignature != null ||
      transaction.signatures?.length
    )
      throw new RpcResponse.InvalidParamsError({
        message: 'Cannot fill funding on an already signed transaction.',
      })

    const chainId_request =
      transaction.chainId === undefined
        ? undefined
        : Number(transaction.chainId)
    const chainId_explicit = options?.chainId

    for (const chainId of [chainId_request, chainId_explicit])
      if (
        chainId !== undefined &&
        (!Number.isSafeInteger(chainId) || chainId <= 0)
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a valid chain ID.',
        })

    if (
      chainId_request !== undefined &&
      chainId_explicit !== undefined &&
      chainId_request !== chainId_explicit
    )
      throw new RpcResponse.InvalidParamsError({
        message: 'Conflicting chain ids.',
      })

    const chainId = chainId_explicit ?? chainId_request ?? 4217
    const requestOptions = { ...options, chainId }

    const client = createClient({
      transport: custom({
        request: ({ method, params }, requestOptions_) =>
          next({ method, params }, { ...requestOptions_, ...requestOptions }),
      }),
    })

    const requireFunds: FundingRequirement.Rpc[] = []

    for (const requirement of transaction.requireFunds) {
      if (!requirement || typeof requirement !== 'object')
        throw new RpcResponse.InvalidParamsError({
          message:
            'Each funding requirement must specify `token` and `amount`.',
        })

      if (
        requirement.sources !== undefined &&
        !Array.isArray(requirement.sources)
      )
        throw new RpcResponse.InvalidParamsError({
          message: '`sources` must be an array when supplied.',
        })

      const decoded = FundingRequirement.fromRpc({
        ...requirement,
        sources: requirement.sources ?? [],
      })

      if (requirement.sources !== undefined) {
        requireFunds.push(FundingRequirement.toRpc(decoded))
        continue
      }

      if (
        transaction.keyId ||
        transaction.keyAuthorization ||
        transaction.multisigSimulation
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            'Access key and multisig funding require explicit sources until policy resolution is supported.',
        })

      if (!transaction.from)
        throw new RpcResponse.InvalidParamsError({
          message:
            'Funding discovery requires the transaction sender (`from`).',
        })

      const route = await (parameters.getRoute ?? defaultRoute)({
        chainId,
        token: Address_.checksum(decoded.token),
      })
      if (!route)
        throw new RpcResponse.InvalidParamsError({
          message: `No funding route configured for ${requirement.token}.`,
        })

      const discovery = await discover(client, {
        account: transaction.from,
        amount: decoded.amount,
        slippageBps: decoded.slippageBps ?? route.slippageBps ?? 0,
        sources: route.sources,
        token: decoded.token,
      })

      requireFunds.push(
        FundingRequirement.toRpc({
          ...decoded,
          slippageBps: discovery.slippageBps,
          sources: discovery.sources.map(({ to, data }) => ({ to, data })),
        }),
      )
    }

    return next(
      { ...request, params: [{ ...transaction, requireFunds }, ...rest] },
      requestOptions,
    )
  }
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

  /** Owner-authorized discovery configuration. */
  export type Parameters = {
    /** Resolves source configurations for a chain and output token. Defaults to known same-currency Native DEX inputs on mainnet, testnet, and localnet. */
    getRoute?:
      | ((context: {
          /** Chain selected for discovery and transaction filling. */
          chainId: number
          /** Checksummed output token address. */
          token: Address
        }) => Route | undefined | Promise<Route | undefined>)
      | undefined
  }

  /** Unsigned RPC transaction fields used by funding resolution. */
  export type Transaction = Omit<TransactionRequest.Rpc, 'requireFunds'> &
    Partial<Pick<TransactionRpc, 'feePayerSignature' | 'signature'>> &
    Pick<TransactionRequestTempo, 'signatures'> & {
      /** Access key used to execute the transaction. */
      keyId?: Address | undefined
      /** Funding requirements to resolve before filling. */
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
