import type { Address } from 'abitype'
import { Hex, RpcResponse } from 'ox'
import { Transaction as core_Transaction } from 'ox/tempo'
import * as VirtualAddress from 'ox/tempo/VirtualAddress'
import { tempo, tempoModerato } from '../../../chains/index.js'
import type { Client } from '../../../clients/createClient.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { http } from '../../../clients/transports/http.js'
import { zeroAddress } from '../../../constants/address.js'
import type { Call } from '../../../types/calls.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { isAddress } from '../../../utils/address/isAddress.js'
import { formatUnits } from '../../../utils/unit/formatUnits.js'
import * as Abis from '../../Abis.js'
import * as Actions from '../../actions/index.js'
import type * as Relay from '../../Relay.js'
import * as Transaction from '../../Transaction.js'
import { fill, resolveAutoSwapMetadata } from './autoSwap.js'
import * as Store from './cache.js'
import * as ExecutionError from './executionError.js'
import * as Sponsorship from './feePayer.js'
import {
  callTargetTokens,
  resolveFeeToken,
  resolveTokenMetadata,
} from './feeToken.js'
import { computeFee, simulateAndParseDiffs } from './simulate.js'
import * as Utils from './utils.js'
export const configuration = Symbol('relay.services')
export const response = Symbol('relay.response')
const service = Symbol('relay.service')
const resolveClient = Symbol('relay.client')

type Options = {
  autoSwap?: Relay.autoSwap.Options | undefined
  feePayer?: Relay.feePayer.Options | undefined
  feeToken?: Relay.feeToken.Options | undefined
  simulate?: Relay.simulate.Options | undefined
}
type RequestOptions = Relay.handleRequest.RequestOptions & {
  [configuration]?: Options | undefined
  [response]?:
    | { sponsorship_details?: Sponsorship.SponsorshipDetails | undefined }
    | undefined
}
type Handler = Relay.handleRequest.Handler & {
  [resolveClient]?:
    | ((chainId: number) => {
        chain: { id: number }
        request: Client['request']
      })
    | undefined
}

export function create<name extends keyof Options>(
  name: name,
  options: NonNullable<Options[name]>,
): Relay.Plugin {
  return Object.assign(
    (next: Relay.handleRequest.Handler) =>
      (
        request: Relay.handleRequest.Request,
        requestOptions: RequestOptions = {},
      ) =>
        next(request, {
          ...requestOptions,
          [configuration]: {
            ...requestOptions[configuration],
            [name]: options,
          },
        } as RequestOptions),
    { [service]: true as const },
  )
}

export function isPlugin(plugin: Relay.Plugin) {
  return service in plugin
}

export function withClient(
  next: Relay.handleRequest.Handler,
  getClient: NonNullable<Handler[typeof resolveClient]>,
): Handler {
  return Object.assign(next, { [resolveClient]: getClient })
}

export function handleRequest(
  next: Handler,
  options: { multisig: boolean },
): Relay.handleRequest.Handler {
  const handle = async (
    request: Relay.handleRequest.Request,
    requestOptions: RequestOptions = {},
  ) => {
    const config = requestOptions[configuration]
    if (!config) return next(request, requestOptions)
    const { [configuration]: _, ...rest } = requestOptions
    const isFill = request.method === 'eth_fillTransaction'
    const isRaw =
      request.method === 'eth_signRawTransaction' ||
      request.method === 'eth_sendRawTransaction' ||
      request.method === 'eth_sendRawTransactionSync'
    if (!isFill && !isRaw) return next(request, rest)
    const first = request.params?.[0]
    if (isFill && (!first || typeof first !== 'object' || Array.isArray(first)))
      throw new RpcResponse.InvalidParamsError({
        message: 'Expected a transaction object.',
      })
    const bodyChainId =
      isRaw && Utils.isSerializedTempoTransaction(first)
        ? Transaction.deserialize(first).chainId
        : typeof first === 'object' && first
          ? Utils.resolveChainId((first as Record<string, unknown>).chainId)
          : undefined
    if (
      bodyChainId !== undefined &&
      rest.chainId !== undefined &&
      bodyChainId !== rest.chainId
    )
      throw new RpcResponse.InvalidParamsError({
        message: 'Conflicting chain ids.',
      })
    const chainId = rest.chainId ?? bodyChainId
    const getClient = (id = chainId): Client => {
      if (id === undefined || !Number.isSafeInteger(id) || id <= 0)
        throw new RpcResponse.InvalidParamsError({
          message: 'A chain ID is required to resolve the downstream client.',
        })
      const upstream = next[resolveClient]?.(id)
      if (upstream && upstream.chain.id !== id)
        throw new RpcResponse.InvalidParamsError({
          message: 'Conflicting chain ids.',
        })
      return createClient({
        chain: { ...tempo, ...upstream?.chain, id },
        batch: { multicall: { deployless: true } },
        transport: custom({
          request: (request, options) =>
            next(request, { ...rest, ...options, chainId: id }),
        }),
      })
    }
    const getTokens = async (
      id: number | undefined,
    ): Promise<readonly Address[]> => {
      if (id === undefined) return []
      if (config.feeToken?.resolveTokens)
        return config.feeToken.resolveTokens(id)
      if (id !== tempo.id && id !== tempoModerato.id) return []
      const url = new URL('https://api.tempo.xyz/v1/tokenlist')
      url.searchParams.set('chainId', String(id))
      const res = await fetch(url, {
        ...(rest.signal ? { signal: rest.signal } : {}),
        ...(config.feeToken?.apiKey
          ? { headers: { 'tempo-api-key': config.feeToken.apiKey } }
          : {}),
      })
      if (res.status !== 200) return []
      const body = (await res.json()) as { tokens: { address: Address }[] }
      return body.tokens.map((token) => token.address)
    }
    const feePayerOptions = config.feePayer?.account
      ? (config.feePayer as Relay.feePayer.Options & {
          account: NonNullable<Relay.feePayer.Options['account']>
        })
      : undefined
    const record = (details: Sponsorship.SponsorshipDetails | undefined) => {
      if (details && rest[response])
        rest[response].sponsorship_details = details
    }
    if (request.method === 'eth_fillTransaction') {
      const result = await handleFill(request, {
        chainId,
        client: getClient(),
        getTokens,
        feePayerOptions,
        multisig: options.multisig,
        internal_allowUnsafeUrls:
          config.feePayer?.internal_allowUnsafeUrls ?? false,
        features: {
          autoSwap: !!config.autoSwap,
          feeTokenResolution: !!config.feeToken,
          simulate: !!config.simulate,
        },
        autoSwap: config.autoSwap
          ? { slippage: config.autoSwap.slippage ?? 0.05 }
          : undefined,
        feeTokenStore: Store.scoped(config.feeToken?.cache),
        autoSwapStore: Store.scoped(config.autoSwap?.cache),
        simulateStore: Store.scoped(config.simulate?.cache),
      })
      record(
        'sponsorship_details' in result
          ? result.sponsorship_details
          : undefined,
      )
      return result.result
    }
    if (
      request.method === 'eth_signRawTransaction' ||
      request.method === 'eth_sendRawTransaction' ||
      request.method === 'eth_sendRawTransactionSync'
    ) {
      if (!feePayerOptions) {
        if (request.method === 'eth_signRawTransaction')
          throw new RpcResponse.MethodNotFoundError({
            message:
              'eth_signRawTransaction requires a fee payer to be configured on the relay. Add `Relay.feePayer({ account })` to enable transaction sponsorship.',
          })
        return next(request, { ...rest, chainId })
      }
      const serialized = request.params?.[0]
      if (
        typeof serialized !== 'string' ||
        !Sponsorship.requestsRawSponsorship(serialized as Hex.Hex)
      )
        return next(request, { ...rest, chainId })
      const result = await Sponsorship.handleRawTransaction({
        ...feePayerOptions,
        getClient,
        getFeeToken: async (id) => (await getTokens(id))[0],
        method: request.method,
        request,
      })
      record(result.sponsorshipDetails)
      return result.result
    }
    return next(request, { ...rest, chainId })
  }
  return async (request, options) => {
    try {
      return await handle(request, options)
    } catch (error) {
      throw Utils.toRpcError(error)
    }
  }
}

type FillOptions = {
  chainId: number | undefined
  client: Client
  getTokens: (chainId: number | undefined) => Promise<readonly Address[]>
  feePayerOptions:
    | (Relay.feePayer.Options & {
        account: NonNullable<Relay.feePayer.Options['account']>
      })
    | undefined
  multisig: boolean
  internal_allowUnsafeUrls: boolean
  features: {
    autoSwap: boolean
    feeTokenResolution: boolean
    simulate: boolean
  }
  autoSwap: { slippage: number } | undefined
  feeTokenStore: Store.Store | undefined
  autoSwapStore: Store.Store | undefined
  simulateStore: Store.Store | undefined
}
async function handleFill(
  request: Relay.handleRequest.Request,
  options: FillOptions,
) {
  const {
    chainId,
    client,
    getTokens,
    feePayerOptions,
    multisig,
    internal_allowUnsafeUrls,
    features,
    autoSwap,
    feeTokenStore,
    autoSwapStore,
    simulateStore,
  } = options
  const params = request.params as readonly unknown[]

  const parameters = params[0] as Record<string, unknown>
  const capabilities = (parameters.capabilities ?? {}) as Record<
    string,
    unknown
  >

  try {
    const from =
      typeof parameters.from === 'string'
        ? (parameters.from as Address)
        : undefined
    const requestFeeToken =
      typeof parameters.feeToken === 'string'
        ? (parameters.feeToken as Address)
        : undefined
    const externalFeePayerUrl =
      typeof parameters.feePayer === 'string'
        ? Sponsorship.ExternalFeePayerUrl.normalize(parameters.feePayer, {
            allowUnsafe: internal_allowUnsafeUrls,
          })
        : undefined
    const requestsSponsorship =
      (!!feePayerOptions || !!externalFeePayerUrl) &&
      parameters.feePayer !== false
    // Default to `true`. Dapps that don't render diffs can pass
    // `capabilities.balanceDiffs: false` to skip the post-fill
    // `tempo_simulateV1` round trip (~250-400ms).
    const requireBalanceDiffs = capabilities.balanceDiffs !== false

    const { feePayer: _feePayer, ...normalized } =
      Utils.normalizeFillTransactionRequest(parameters)
    const hasMultisigSimulation =
      typeof normalized.multisigSimulation === 'object' &&
      normalized.multisigSimulation !== null
    const shouldDeferFeePayerSignature =
      feePayerOptions && multisig && hasMultisigSimulation

    // A sponsor's preferred token overrides the request token because the sponsor pays the fee.
    const sponsoredFeeToken = requestsSponsorship
      ? (feePayerOptions?.feeToken ?? requestFeeToken)
      : requestFeeToken

    const baseTx = {
      ...normalized,
      ...(typeof chainId !== 'undefined' ? { chainId } : {}),
      ...(sponsoredFeeToken ? { feeToken: sponsoredFeeToken } : {}),
    }

    let filled: Awaited<ReturnType<typeof fill>>
    let sponsored = false
    let feeToken = sponsoredFeeToken
    const tokens = getTokens(chainId)

    // Lazily resolve a swap source token when autoSwap needs one.
    const resolveFeeTokenForSwap = from
      ? async (insufficientToken: Address) =>
          resolveFeeToken(client, {
            account: from,
            feeToken: undefined,
            store: feeTokenStore,
            tokens: (await tokens).filter(
              (t) => t.toLowerCase() !== insufficientToken.toLowerCase(),
            ),
          })
      : undefined

    // Include call-target tokens so a sender can pay with a transferred token even when the configured list omits it.
    const configuredTokens = await tokens
    const unsponsoredTokens = [
      ...configuredTokens,
      ...callTargetTokens(baseTx).filter(
        (t) =>
          !configuredTokens.some((rt) => rt.toLowerCase() === t.toLowerCase()),
      ),
    ]

    // When the app provides its own fee payer URL, route the fill
    // through that service so it can sign the transaction.
    const fillClient = externalFeePayerUrl
      ? createClient({
          chain: client.chain,
          batch: { multicall: { deployless: true } },
          transport: http(externalFeePayerUrl, {
            fetchOptions: { redirect: 'error' },
          }),
        })
      : client

    if (
      requestsSponsorship &&
      (externalFeePayerUrl || !feePayerOptions?.validate)
    ) {
      // Unconditional sponsorship skips sender-balance resolution. An external relay applies its own policy; use the first configured token when none is explicit.
      if (!feeToken) feeToken = configuredTokens[0]
      const transaction = {
        ...baseTx,
        feePayer: true,
        ...(feeToken ? { feeToken } : {}),
      }
      if (Sponsorship.isPreparedTransaction(transaction)) {
        filled = {
          transaction: Utils.normalizeTempoTransaction(transaction),
          sponsor: undefined,
        }
      } else {
        filled = await fill(fillClient, {
          autoSwap,
          feeToken,
          store: autoSwapStore,
          resolveFeeToken: resolveFeeTokenForSwap,
          transaction,
        })
        // The chain echoes feeToken: null for sponsored fills served
        // by viem clients that strip feeToken pre-sign; re-inject
        // before the spread in mergeCallsFromRequest drops it.
        if (
          feeToken &&
          filled?.transaction &&
          (filled.transaction as { feeToken?: Address | null }).feeToken == null
        )
          (filled.transaction as { feeToken?: Address }).feeToken = feeToken
      }
      sponsored = true
    } else if (requestsSponsorship && feePayerOptions?.validate) {
      // Fill the sponsored candidate first, then validate it. Rejection falls back to a sender-paid fill.
      const sponsoredTx = { ...baseTx, feePayer: true }

      if (Sponsorship.isPreparedTransaction(sponsoredTx)) {
        // Already prepared: skip fills, just validate sponsorship.
        const prepared = {
          transaction: Utils.normalizeTempoTransaction(sponsoredTx),
          sponsor: undefined,
        }
        sponsored = await Sponsorship.shouldSponsor({
          sender: from,
          transaction: prepared.transaction,
          validate: feePayerOptions!.validate,
        })
        filled = prepared
      } else {
        const options = {
          autoSwap,
          store: autoSwapStore,
          resolveFeeToken: resolveFeeTokenForSwap,
        }
        const fill_sponsored = await fill(fillClient, {
          ...options,
          feeToken,
          transaction: sponsoredTx,
        })
        sponsored = await Sponsorship.shouldSponsor({
          sender: from,
          transaction: fill_sponsored.transaction,
          validate: feePayerOptions!.validate,
        })
        if (sponsored) {
          filled = fill_sponsored
        } else {
          // Sponsor rejected: resolve fee token and fill unsponsored.
          const feeToken_unsponsored = features.feeTokenResolution
            ? await resolveFeeToken(client, {
                account: from,
                feeToken: requestFeeToken,
                store: feeTokenStore,
                tokens: unsponsoredTokens,
              })
            : requestFeeToken
          const tx_unsponsored = {
            ...baseTx,
            ...(feeToken_unsponsored ? { feeToken: feeToken_unsponsored } : {}),
          }
          filled = await fill(client, {
            ...options,
            feeToken: feeToken_unsponsored,
            transaction: tx_unsponsored,
          })
          feeToken = feeToken_unsponsored
        }
      }
    } else {
      // Path C: no sponsorship configured: resolve fee token, fill once.
      feeToken = features.feeTokenResolution
        ? await resolveFeeToken(client, {
            account: from,
            feeToken: requestFeeToken,
            store: feeTokenStore,
            tokens: unsponsoredTokens,
          })
        : requestFeeToken
      const transaction = { ...baseTx, ...(feeToken ? { feeToken } : {}) }
      filled = await fill(client, {
        autoSwap,
        feeToken,
        store: autoSwapStore,
        resolveFeeToken: resolveFeeTokenForSwap,
        transaction,
      })
    }

    const transaction_filled = filled.transaction
    const swap = 'swap' in filled ? filled.swap : undefined
    if (!feeToken)
      feeToken =
        (transaction_filled.feeToken as Address | undefined) ??
        configuredTokens[0]

    // Parallelize: simulate, fee payer signing, and autoSwap metadata.
    const alreadySigned =
      'feePayerSignature' in transaction_filled &&
      transaction_filled.feePayerSignature != null

    const calls = extractCalls(transaction_filled)
    const [simulation, signed, autoSwap_, virtualAddresses] = await Promise.all(
      [
        // Simulate and compute balance diffs + fee.
        // When `capabilities.balanceDiffs` is `false`, skip simulate
        // and compute fee directly from cached metadata.
        (async () => {
          if (!features.simulate)
            return { balanceDiffs: undefined, fee: undefined }
          if (requireBalanceDiffs)
            return simulateAndParseDiffs(client, {
              account: from,
              calls,
              swap,
              feeToken,
              gas: transaction_filled.gas,
              store: simulateStore,
              maxFeePerGas: transaction_filled.maxFeePerGas,
            })
          const fee = await computeFee(client, {
            feeToken,
            gas: transaction_filled.gas,
            store: simulateStore,
            maxFeePerGas: transaction_filled.maxFeePerGas,
          }).catch(() => undefined)
          return { balanceDiffs: undefined, fee }
        })(),
        // Sign as fee payer (if sponsored and not already signed).
        (async () => {
          // Multisig finalization changes the sender signature. Sign after quorum.
          if (shouldDeferFeePayerSignature)
            return {
              sponsorshipDetails: undefined,
              transaction: transaction_filled,
            }
          // Never sign with the managed fee payer for an app-provided
          // external fee payer URL: that relay is the sponsorship authority,
          // and signing here would bypass this fee payer's `validate` gate.
          if (
            !(
              sponsored &&
              feePayerOptions &&
              !externalFeePayerUrl &&
              !alreadySigned
            )
          )
            return {
              sponsorshipDetails: undefined,
              transaction: transaction_filled,
            }
          return Sponsorship.sign({
            account: feePayerOptions.account,
            onSponsored: feePayerOptions.onSponsored,
            sender: from,
            transaction: transaction_filled,
          })
        })(),
        // Resolve autoSwap metadata (when AMM path was taken).
        resolveAutoSwapMetadata(client, {
          autoSwap,
          store: autoSwapStore,
          swap,
        }),
        // Resolve virtual-address recipients so wallets can show the
        // eventual master address before signing.
        resolveVirtualAddresses(client, { calls }),
      ],
    )
    const { balanceDiffs, fee } = simulation
    const { sponsorshipDetails, transaction: transaction_final } = signed

    const sponsor = (() => {
      if (!sponsored) return undefined
      // App-provided fee payer: relay back the sponsor from the upstream response.
      if (externalFeePayerUrl) return filled.sponsor
      if (feePayerOptions) return Sponsorship.getSponsor(feePayerOptions)
      return filled.sponsor
    })()

    return {
      result: {
        ...(sponsor ? { sponsor } : {}),
        tx: core_Transaction.toRpc(
          transaction_final as core_Transaction.Transaction,
        ),
        capabilities: {
          balanceDiffs,
          fee,
          sponsored: !!sponsor,
          ...(sponsor ? { sponsor } : {}),
          ...(autoSwap_ ? { autoSwap: autoSwap_ } : {}),
          ...(virtualAddresses ? { virtualAddresses } : {}),
        },
      },
      ...(sponsorshipDetails
        ? { sponsorship_details: sponsorshipDetails }
        : {}),
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if (capabilities.errors !== true) throw error

    const revert = ExecutionError.parse(error)

    const parameters = params[0] as Record<string, unknown>
    const stub = {
      from: parameters.from,
      to: parameters.to ?? null,
      gas: '0x0',
      nonce: '0x0',
      value: '0x0',
      maxFeePerGas: '0x0',
      maxPriorityFeePerGas: '0x0',
    }

    if (revert?.errorName === 'InsufficientBalance') {
      const args = revert.args as [bigint, bigint, Address]
      const [available, required, token] = args

      const normalized = Utils.normalizeFillTransactionRequest(parameters)

      // Simulate from zero address for optimistic balance diffs.
      const optimisticCalls = normalized ? extractCalls(normalized) : undefined
      const [{ balanceDiffs }, virtualAddresses] = optimisticCalls
        ? await Promise.all([
            simulateAndParseDiffs(client, {
              account: zeroAddress,
              calls: optimisticCalls,
              store: simulateStore,
            }),
            resolveVirtualAddresses(client, { calls: optimisticCalls }),
          ])
        : [{ balanceDiffs: undefined }, undefined]

      // Re-key balance diffs from zero address to the real sender.
      const senderDiffs =
        parameters.from && balanceDiffs
          ? { [parameters.from as Address]: balanceDiffs[zeroAddress] ?? [] }
          : balanceDiffs

      const metadata = await resolveTokenMetadata(client, {
        token,
        store: simulateStore,
      }).catch(() => undefined)
      const deficit = required - available
      return {
        result: {
          tx: stub,
          capabilities: {
            balanceDiffs: senderDiffs,
            error: ExecutionError.serialize(revert),
            requireFunds: metadata
              ? {
                  amount: Hex.fromNumber(deficit) as `0x${string}`,
                  decimals: metadata.decimals,
                  formatted: formatUnits(deficit, metadata.decimals),
                  token,
                  symbol: metadata.symbol,
                }
              : undefined,
            sponsored: false,
            ...(virtualAddresses ? { virtualAddresses } : {}),
          },
        },
      }
    }

    const normalized = Utils.normalizeFillTransactionRequest(parameters)
    const virtualAddresses = normalized
      ? await resolveVirtualAddresses(client, {
          calls: extractCalls(normalized),
        }).catch(() => undefined)
      : undefined

    return {
      result: {
        tx: stub,
        capabilities: {
          error: ExecutionError.serialize(revert),
          sponsored: false,
          ...(virtualAddresses ? { virtualAddresses } : {}),
        },
      },
    }
  }
}
async function resolveVirtualAddresses(
  client: Client,
  options: { calls: readonly Call[] },
): Promise<Record<Address, Address | null> | undefined> {
  const targets = getVirtualAddressTargets(options.calls)
  if (targets.length === 0) return undefined

  const masters = new Map<string, { addresses: Address[]; masterId: Hex.Hex }>()
  for (const address of targets) {
    const { masterId } = VirtualAddress.parse(address)
    const lower = masterId.toLowerCase()
    const entry = masters.get(lower) ?? { addresses: [] as Address[], masterId }
    entry.addresses.push(address)
    masters.set(lower, entry)
  }

  const entries = await Promise.all(
    [...masters.values()].map(async ({ addresses, masterId }) => {
      const master = await Actions.virtualAddress.getMasterAddress(client, {
        masterId,
      })
      return addresses.map((address) => [address, master] as const)
    }),
  )
  return Object.fromEntries(entries.flat()) as Record<Address, Address | null>
}

function getVirtualAddressTargets(calls: readonly Call[]): readonly Address[] {
  const targets = new Set<Address>()
  for (const call of calls) {
    for (const address of [call.to, decodeTransferRecipient(call.data)]) {
      if (!address || !isAddress(address) || !VirtualAddress.isVirtual(address))
        continue
      targets.add(address.toLowerCase() as Address)
    }
  }
  return [...targets]
}

function decodeTransferRecipient(data?: string): Address | undefined {
  if (!data) return undefined
  const selector = data.slice(0, 10).toLowerCase()
  if (!transferSelectors.has(selector)) return undefined
  try {
    const { args, functionName } = decodeFunctionData({
      abi: Abis.tip20,
      data: data as Hex.Hex,
    })
    if (
      (functionName === 'transfer' || functionName === 'transferWithMemo') &&
      typeof args[0] === 'string'
    )
      return args[0]
    if (
      (functionName === 'transferFrom' ||
        functionName === 'transferFromWithMemo') &&
      typeof args[1] === 'string'
    )
      return args[1]
  } catch {}
  return undefined
}

const transferSelectors = new Set([
  '0xa9059cbb',
  '0x95777d59',
  '0x23b872dd',
  '0x929c2539',
])

function extractCalls(transaction: Record<string, unknown>): readonly Call[] {
  const calls = transaction.calls as readonly Call[] | undefined
  if (calls && calls.length > 0)
    return calls.map((c) => ({
      ...(c.to ? { to: c.to } : {}),
      ...(c.data ? { data: c.data } : {}),
      ...(c.value ? { value: c.value } : {}),
    })) as readonly Call[]
  return [
    {
      ...(transaction.to ? { to: transaction.to as Address } : {}),
      ...(transaction.data ? { data: transaction.data as `0x${string}` } : {}),
      ...(transaction.value ? { value: transaction.value as bigint } : {}),
    },
  ] as readonly Call[]
}
