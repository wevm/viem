import type { Address } from 'abitype'
import * as Address_ from 'ox/Address'
import * as Hex_ from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import {
  FundingPolicy,
  FundingRequirement,
  FundingSource,
  KeyAuthorization,
  type TransactionRequest,
} from 'ox/tempo'
import { getBlock } from '../actions/public/getBlock.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import type { Tokens } from '../tokens/defineToken.js'
import { tokens } from '../tokens/sets.js'
import type {
  EIP1193RequestOptions,
  PublicRpcSchema,
} from '../types/eip1193.js'
import type { Hex } from '../types/misc.js'
import type { UnionOmit } from '../types/utils.js'
import * as Addresses from './Addresses.js'
import { getFundingPolicyId, getMetadata } from './actions/accessKey.js'
import { discover, getPolicy, policyExists } from './actions/funding.js'
import type { FundingRequirementIntent } from './internal/funding.js'
import * as Store from './Store.js'
import type { TransactionRequestTempo, TransactionRpc } from './Transaction.js'

/** An unsigned funding requirement whose sources may be discovered by a relay. */
export type Requirement = FundingRequirementIntent

/** Funding intent at the unsigned RPC boundary. */
export type RequirementRpc = Omit<FundingRequirement.Rpc, 'sources'> & {
  /** Omission requests discovery; an empty array is explicit. */
  sources?: FundingRequirement.Rpc['sources'] | undefined
}

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
 * Resolves funding sources and access key policy rules before transaction filling.
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
  const store = parameters.store ?? Store.memory()

  return async (request, options) => {
    if (request.method === 'eth_fillKeyAuthorization') {
      const [input] = (request.params ?? []) as RpcSchema[1]['Parameters']
      if (
        !input ||
        request.params?.length !== 1 ||
        !Address_.validate(input.account) ||
        !input.keyAuthorization
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            'Expected an owner `account` and unsigned `keyAuthorization`.',
        })
      const authorization = input.keyAuthorization
      if (authorization.signature !== undefined)
        throw new RpcResponse.InvalidParamsError({
          message: 'Cannot fill an already signed key authorization.',
        })
      if (
        authorization.account &&
        !Address_.isEqual(authorization.account, input.account)
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            '`keyAuthorization.account` must match the requested owner account.',
        })
      // Validate the unsigned fields without passing unresolved intent to the codec.
      const decoded = (() => {
        try {
          const { fundingPolicy, ...rest } = authorization
          const decoded = KeyAuthorization.fromRpcUnsigned({
            ...rest,
            ...(fundingPolicy !== true && fundingPolicy !== undefined
              ? { fundingPolicy }
              : {}),
          })
          KeyAuthorization.getSignPayload(decoded)
          return decoded
        } catch {
          throw new RpcResponse.InvalidParamsError({
            message:
              '`keyAuthorization` contains invalid unsigned authorization fields.',
          })
        }
      })()
      if (authorization.fundingPolicy !== true)
        return { keyAuthorization: authorization }

      const chainId =
        options?.chainId ??
        (decoded.chainId === 0n ? 4217 : Number(decoded.chainId))
      if (
        !Number.isSafeInteger(chainId) ||
        chainId <= 0 ||
        (decoded.chainId !== 0n && decoded.chainId !== BigInt(chainId))
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'The key authorization chain must match the request chain.',
        })
      const policyId = parameters.policyId
      if (
        policyId === undefined ||
        policyId <= 0n ||
        policyId > 0xffffffffffffffffn
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            '`fundingPolicy: true` requires a configured nonzero uint64 `policyId`.',
        })
      const client = createClient({
        transport: custom({
          request: ({ method, params }, requestOptions) =>
            next(
              { method, params },
              { ...requestOptions, ...options, chainId },
            ),
        }),
      })
      if (!(await policyExists(client, { policyId })))
        throw new RpcResponse.InvalidParamsError({
          message: `Default funding policy ${policyId} does not exist on chain ${chainId}.`,
        })
      return {
        keyAuthorization: {
          ...authorization,
          fundingPolicy: Hex_.fromNumber(policyId),
        },
      }
    }

    if (request.method === 'funding_registerPolicyRules') {
      const [parameters] = (request.params ?? []) as RpcSchema[0]['Parameters']
      if (!parameters || request.params?.length !== 1)
        throw new RpcResponse.InvalidParamsError({
          message:
            'Expected one parameter containing `chainId` and encoded `rules`.',
        })
      const chainId = Number(parameters.chainId)
      if (
        !Hex_.validate(parameters.chainId) ||
        !Number.isSafeInteger(chainId) ||
        chainId <= 0 ||
        (options?.chainId !== undefined && options.chainId !== chainId)
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            'Registration requires a valid `chainId` matching the request chain.',
        })
      const rules = (() => {
        try {
          return FundingPolicy.decode(parameters.rules)
        } catch {
          throw new RpcResponse.InvalidParamsError({
            message:
              '`rules` must contain canonical ABI-encoded funding policy rules.',
          })
        }
      })()
      const rulesHash = FundingPolicy.hash(rules)
      await store.setItem(
        `funding:${chainId}:${Addresses.fundingPolicy.toLowerCase()}:rules:${rulesHash.toLowerCase()}`,
        FundingPolicy.encode(rules),
      )
      return { rulesHash }
    }

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

    const policy = await (async () => {
      // A key authorization can also accompany an owner transaction. Only keyId
      // identifies delegated execution; the node validates its signed authority.
      if (!transaction.keyId) return undefined
      if (!transaction.from)
        throw new RpcResponse.InvalidParamsError({
          message:
            'Access key funding requires the transaction sender (`from`).',
        })

      const block = await getBlock(client)
      const metadata = await getMetadata(client, {
        account: transaction.from,
        accessKey: transaction.keyId,
        blockNumber: block.number,
      })
      if (metadata.isRevoked)
        throw new RpcResponse.InvalidParamsError({
          message: 'The funding access key is revoked.',
        })

      const authorization = transaction.keyAuthorization
        ? KeyAuthorization.fromRpc(transaction.keyAuthorization)
        : undefined
      if (
        authorization &&
        (!Address_.isEqual(authorization.address, transaction.keyId) ||
          (authorization.account &&
            !Address_.isEqual(authorization.account, transaction.from)) ||
          (authorization.chainId !== 0n &&
            authorization.chainId !== BigInt(chainId)))
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            '`keyAuthorization` must match the funding account, access key, and chain.',
        })

      const installed = Address_.isEqual(metadata.address, transaction.keyId)
      if (!installed && !authorization)
        throw new RpcResponse.InvalidParamsError({
          message:
            'The funding access key is not installed; supply `keyAuthorization`.',
        })
      const expiry = installed ? metadata.expiry : authorization?.expiry
      if (expiry != null && BigInt(expiry) <= block.timestamp)
        throw new RpcResponse.InvalidParamsError({
          message: 'The funding access key has expired.',
        })

      const policy = installed
        ? await getFundingPolicyId(client, {
            account: transaction.from,
            accessKey: transaction.keyId,
            blockNumber: block.number,
          })
        : authorization?.fundingPolicy
      if (policy === undefined || policy === 0n)
        throw new RpcResponse.InvalidParamsError({
          message: 'The access key has no funding policy.',
        })
      if (typeof policy === 'object')
        return {
          rulesHash: FundingPolicy.hash(policy.rules),
          rules: FundingPolicy.encode(policy.rules),
          blockNumber: block.number,
        }
      const { rulesHash } = await getPolicy(client, {
        policyId: policy,
        blockNumber: block.number,
      })
      return { rulesHash, policyId: policy, blockNumber: block.number }
    })()

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

      if (transaction.multisigSimulation && requirement.sources === undefined)
        throw new RpcResponse.InvalidParamsError({
          message: 'Multisig funding requires explicit sources.',
        })

      const policyRules = policy
        ? await resolvePolicyRules({
            ...policy,
            chainId,
            rules: decoded.policyRules ?? policy.rules,
            store,
          })
        : undefined
      const rules = policyRules ? FundingPolicy.decode(policyRules) : undefined
      const sources =
        rules &&
        Object.entries(rules.sources).find(([token]) =>
          Address_.isEqual(token as Address, decoded.token),
        )?.[1]
      if (rules && !sources)
        throw new RpcResponse.InvalidParamsError({
          message: `The funding policy does not allow output token ${decoded.token}.`,
        })
      if (
        rules &&
        decoded.slippageBps !== undefined &&
        decoded.slippageBps > rules.maxSlippageBps
      )
        throw new RpcResponse.InvalidParamsError({
          message: '`slippageBps` exceeds the funding policy maximum.',
        })

      if (requirement.sources !== undefined) {
        requireFunds.push(
          FundingRequirement.toRpc({
            ...decoded,
            ...(policyRules ? { policyRules } : {}),
          }),
        )
        continue
      }

      if (!transaction.from)
        throw new RpcResponse.InvalidParamsError({
          message:
            'Funding discovery requires the transaction sender (`from`).',
        })

      const route =
        rules && sources
          ? { slippageBps: rules.maxSlippageBps, sources }
          : await (parameters.getRoute ?? defaultRoute)({
              chainId,
              token: Address_.checksum(decoded.token),
              transaction,
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
          ...(policyRules ? { policyRules } : {}),
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

  /** Funding discovery and policy rules storage. */
  export type Parameters = {
    /** Default policy selected only for `fundingPolicy: true`. */
    policyId?: bigint | undefined
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

/** Loads canonical rules matching the current commitment, never a cached policy ID. */
async function resolvePolicyRules(parameters: {
  chainId: number
  rules?: Hex | undefined
  rulesHash: Hex
  store: Store.Store
}): Promise<Hex> {
  const { chainId, rulesHash, store } = parameters
  const key = `funding:${chainId}:${Addresses.fundingPolicy.toLowerCase()}:rules:${rulesHash.toLowerCase()}`
  const rules = parameters.rules ?? (await store.getItem(key))
  if (rules !== undefined && rules !== null) {
    const decoded = FundingPolicy.decode(rules as Hex)
    if (FundingPolicy.hash(decoded).toLowerCase() !== rulesHash.toLowerCase())
      throw new RpcResponse.InvalidParamsError({
        message:
          'Funding policy rules do not match the current onchain commitment.',
      })
    const encoded = FundingPolicy.encode(decoded)
    await store.setItem(key, encoded)
    return encoded
  }

  throw new RpcResponse.InvalidParamsError({
    message:
      'Funding policy rules are not in the store; supply `policyRules` explicitly.',
  })
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
