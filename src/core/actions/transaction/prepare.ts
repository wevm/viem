import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import * as Blobs from 'ox/Blobs'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as Kzg from 'ox/Kzg'
import type * as TxEnvelopeEip4844 from 'ox/TxEnvelopeEip4844'
import * as Value from 'ox/Value'

import * as Account from '../../Account.js'
import type * as Capabilities from '../../Capabilities.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import * as RpcError from '../../RpcError.js'
import type * as NonceManager from '../../NonceManager.js'
import { isAbortError } from '../../internal/errors.js'
import { LruMap } from '../../internal/lru.js'
import type { Compute } from '../../internal/types.js'
import * as transactionRequest from '../internal/transactionRequest.js'
import { getTransactionCount } from '../address/getTransactionCount.js'
import { get as getBlock } from '../block/get.js'
import { getId } from '../chains/getId.js'
import {
  type estimateFeesPerGas,
  internal_estimateFeesPerGas,
} from '../fee/estimateFeesPerGas.js'
import { Eip1559FeesNotSupportedError } from '../fee/estimateMaxPriorityFeePerGas.js'
import { estimateGas } from './estimateGas.js'
import { fill } from './fill.js'

/** Default `parameters` filled when none are supplied. */
export const defaultParameters = [
  'blobVersionedHashes',
  'chainId',
  'fees',
  'gas',
  'nonce',
  'type',
] as const

/** Whether a network is EIP-1559 enabled, cached per `client.uid`. */
const eip1559NetworkCache = /*#__PURE__*/ new Map<string, boolean>()
/** Whether a node supports `eth_fillTransaction`, cached per `client.uid`. */
const supportsFill = /*#__PURE__*/ new LruMap<boolean>(128)

/**
 * Chain-specific fields the node may return from `eth_fillTransaction` that are
 * safe to carry into the prepared request. This is an allowlist: any other
 * field the node returns (e.g. `calls`) is ignored so a malicious or buggy node
 * cannot inject fields into the request the caller signs over.
 */
const customFields = new Set([
  'feePayerSignature',
  'feeToken',
  'keyAuthorization',
  'nonceKey',
])

/**
 * Prepares a transaction request for signing, by populating the fields required
 * to be signed over (e.g. `nonce`, `chainId`, `type`, fees, `gas`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { request } = await Actions.transaction.prepare(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export async function prepare<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  const options extends prepare.Options<chain>,
>(
  client: Client.Client<chain, account>,
  options: prepare.Options<chain> & options,
): Promise<prepare.ReturnType<chain, account, options>> {
  const account_ = options.account ?? client.account
  const chain = options.chain ?? client.chain
  const parameters = options.parameters ?? defaultParameters
  const { kzg, nonceManager } = options

  const account = account_
    ? typeof account_ === 'string'
      ? Account.from(account_)
      : account_
    : undefined

  let request = { ...options } as Record<string, any>
  request.account = account_

  const hook = (() => {
    const value = chain?.transaction?.prepare
    if (typeof value === 'function')
      return {
        fn: value,
        runAt: [
          'beforeFillTransaction',
        ] as readonly Chain.Chain.Transaction.PreparePhase[],
      }
    if (Array.isArray(value)) return { fn: value[0], runAt: value[1].runAt }
    return undefined
  })()

  let chainId: number | undefined
  async function getChainId(): Promise<number> {
    if (typeof chainId === 'number') return chainId
    if (typeof request.chainId === 'number') return request.chainId
    if (chain) return chain.id
    chainId = await getId(client)
    return chainId
  }

  let block: Block.Block | undefined
  async function getLatestBlock(): Promise<Block.Block> {
    block ??= (await getBlock(client, { blockTag: 'latest' })) as Block.Block
    return block
  }

  let nonce = request.nonce
  if (
    parameters.includes('nonce') &&
    typeof nonce === 'undefined' &&
    account &&
    nonceManager
  )
    nonce = await nonceManager.consume({
      address: account.address,
      chainId: await getChainId(),
      client,
    })

  if (hook?.fn && hook.runAt.includes('beforeFillTransaction')) {
    request = await hook.fn(
      { ...request, chain },
      { client, phase: 'beforeFillTransaction' },
    )
    nonce ??= request.nonce
  }

  const attemptFill = (() => {
    if (
      (parameters.includes('blobVersionedHashes') ||
        parameters.includes('sidecars')) &&
      (request.kzg ?? kzg) &&
      request.blobs
    )
      return false
    if (supportsFill.get(client.uid) === false) return false
    if (!parameters.includes('fees') && !parameters.includes('gas'))
      return false
    if (parameters.includes('chainId') && typeof request.chainId !== 'number')
      return true
    if (parameters.includes('nonce') && typeof nonce !== 'number') return true
    if (
      parameters.includes('fees') &&
      typeof request.gasPrice !== 'bigint' &&
      (typeof request.maxFeePerGas !== 'bigint' ||
        typeof request.maxPriorityFeePerGas !== 'bigint')
    )
      return true
    if (parameters.includes('gas') && typeof request.gas !== 'bigint')
      return true
    return false
  })()

  let capabilities:
    | Capabilities.Extract<'fillTransaction', 'ReturnType'>
    | undefined
  if (attemptFill) {
    try {
      const result = await fill(client, {
        ...omitControl(request),
        account: account_,
        chain,
        nonce,
      } as never)

      supportsFill.set(client.uid, true)
      capabilities = result.capabilities

      const {
        chainId: filledChainId,
        from,
        gas,
        gasPrice,
        nonce: filledNonce,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        type,
        ...rest
      } = result.transaction as Record<string, any>

      const effectiveType = request.type ?? type
      const legacyish =
        effectiveType === 'legacy' || effectiveType === 'eip2930'
      request = {
        ...request,
        ...(from ? { from } : {}),
        ...(type && !request.type ? { type } : {}),
        ...(typeof filledChainId !== 'undefined'
          ? { chainId: filledChainId }
          : {}),
        ...(typeof gas !== 'undefined' ? { gas } : {}),
        ...(typeof gasPrice !== 'undefined' && legacyish ? { gasPrice } : {}),
        ...(typeof filledNonce !== 'undefined'
          ? { nonce: Number(filledNonce) }
          : {}),
        ...(typeof maxFeePerBlobGas !== 'undefined' && !legacyish
          ? { maxFeePerBlobGas }
          : {}),
        ...(typeof maxFeePerGas !== 'undefined' && !legacyish
          ? { maxFeePerGas }
          : {}),
        ...(typeof maxPriorityFeePerGas !== 'undefined' && !legacyish
          ? { maxPriorityFeePerGas }
          : {}),
      }

      // Carry through only the allowlisted chain-specific fields the node
      // returned that the caller did not already supply. Any other field the
      // node sends back (e.g. `calls`) is ignored.
      for (const key of customFields) {
        const value = rest[key]
        if (value !== undefined && value !== null && !(key in request))
          request[key] = value
      }
    } catch (err) {
      if (isAbortError(err)) throw err
      if (err instanceof RpcError.ExecutionRevertedError) throw err
      if (isUnsupportedFill(err)) supportsFill.set(client.uid, false)
      // Otherwise, fall back to manual preparation below.
    }
  }

  nonce ??= request.nonce
  if (account) request.from = account.address
  if (typeof nonce !== 'undefined') request.nonce = nonce

  if (hook?.fn && hook.runAt.includes('beforeFillParameters'))
    request = await hook.fn(
      { ...request, chain },
      { client, phase: 'beforeFillParameters' },
    )

  if (
    parameters.includes('nonce') &&
    typeof request.nonce === 'undefined' &&
    account &&
    !nonceManager
  )
    request.nonce = await getTransactionCount(client, {
      address: account.address,
      blockTag: 'pending',
    })

  const kzg_ = request.kzg ?? kzg
  if (
    (parameters.includes('blobVersionedHashes') ||
      parameters.includes('sidecars')) &&
    request.blobs &&
    kzg_
  ) {
    if (parameters.includes('blobVersionedHashes'))
      request.blobVersionedHashes = Blobs.toVersionedHashes(request.blobs, {
        as: 'Hex',
        kzg: kzg_,
      })
    if (parameters.includes('sidecars'))
      request.sidecars = {
        blobs: request.blobs,
        commitments: Blobs.toCommitments(request.blobs, {
          as: 'Hex',
          kzg: kzg_,
        }),
        cellProofs: Blobs.toCellProofs(request.blobs, { as: 'Hex', kzg: kzg_ }),
      }
  }

  if (parameters.includes('chainId')) request.chainId = await getChainId()

  if (
    (parameters.includes('fees') || parameters.includes('type')) &&
    typeof request.type === 'undefined'
  ) {
    const type = getRequestType(request)
    if (type) request.type = type
    else {
      let isEip1559 = eip1559NetworkCache.get(client.uid)
      if (typeof isEip1559 === 'undefined') {
        isEip1559 = typeof (await getLatestBlock())?.baseFeePerGas === 'bigint'
        eip1559NetworkCache.set(client.uid, isEip1559)
      }
      request.type = isEip1559 ? 'eip1559' : 'legacy'
    }
  }

  if (parameters.includes('fees')) {
    if (request.type !== 'legacy' && request.type !== 'eip2930') {
      if (
        typeof request.maxFeePerGas === 'undefined' ||
        typeof request.maxPriorityFeePerGas === 'undefined'
      ) {
        const { maxFeePerGas, maxPriorityFeePerGas } =
          await internal_estimateFeesPerGas(client, {
            block: await getLatestBlock(),
            chain,
            request,
          })
        if (
          typeof request.maxPriorityFeePerGas === 'undefined' &&
          request.maxFeePerGas &&
          BigInt(request.maxFeePerGas) < maxPriorityFeePerGas
        )
          throw new MaxFeePerGasTooLowError({ maxPriorityFeePerGas })
        request.maxPriorityFeePerGas = maxPriorityFeePerGas
        request.maxFeePerGas = maxFeePerGas
      }
    } else {
      if (
        typeof request.maxFeePerGas !== 'undefined' ||
        typeof request.maxPriorityFeePerGas !== 'undefined'
      )
        throw new Eip1559FeesNotSupportedError()
      if (typeof request.gasPrice === 'undefined') {
        const { gasPrice } = await internal_estimateFeesPerGas(client, {
          block: await getLatestBlock(),
          chain,
          request,
          type: 'legacy',
        })
        request.gasPrice = gasPrice
      }
    }
  }

  if (parameters.includes('gas') && typeof request.gas === 'undefined')
    request.gas = await estimateGas(client, {
      ...omitControl(request),
      account: account_,
      kzg,
    } as never)

  if (hook?.fn && hook.runAt.includes('afterFillParameters'))
    request = await hook.fn(
      { ...request, chain },
      { client, phase: 'afterFillParameters' },
    )

  transactionRequest.assert(request)

  delete request.nonceManager
  delete request.parameters

  return (
    capabilities ? { capabilities, request } : { request }
  ) as prepare.ReturnType<chain, account, options>
}

export declare namespace prepare {
  /** Parameter that {@link prepare} can populate. */
  type Parameter =
    | 'blobVersionedHashes'
    | 'chainId'
    | 'fees'
    | 'gas'
    | 'nonce'
    | 'sidecars'
    | 'type'

  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Chain.ExtractTransactionRequest<chain> & {
    /** Account (or address) the transaction is sent from. */
    account?: Account.Account | Address.Address | undefined
    /** Chain the transaction targets. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Chain id of the transaction. */
    chainId?: number | undefined
    /** KZG context, used to derive blob fields from `blobs`. */
    kzg?: Kzg.Kzg | undefined
    /** Nonce manager used to derive the transaction nonce. */
    nonceManager?: NonceManager.NonceManager | undefined
    /**
     * Parameters to prepare.
     * @default ['blobVersionedHashes', 'chainId', 'fees', 'gas', 'nonce', 'type']
     */
    parameters?: readonly Parameter[] | undefined
  }

  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    options extends Options<chain> = Options<chain>,
  > = {
    /** Node capabilities returned from `eth_fillTransaction` (if any). */
    capabilities?:
      | Capabilities.Extract<'fillTransaction', 'ReturnType'>
      | undefined
    /** The prepared transaction request. */
    request: PreparedRequest<chain, account, options>
  }

  type ErrorType =
    | Account.from.ErrorType
    | fill.ErrorType
    | estimateGas.ErrorType
    | getBlock.ErrorType
    | getTransactionCount.ErrorType
    | getId.ErrorType
    | estimateFeesPerGas.ErrorType
    | transactionRequest.assert.ErrorType
    | MaxFeePerGasTooLowError
    | Errors.GlobalErrorType
}

/** Control-only fields stripped before forwarding a request to a sub-action. */
const controlFields = ['account', 'chain', 'kzg', 'nonceManager', 'parameters']

/** Strips control-only fields before forwarding a request to a sub-action. */
function omitControl(request: Record<string, any>): Record<string, any> {
  const rest = { ...request }
  for (const key of controlFields) delete rest[key]
  return rest
}

/**
 * Determines the transaction type from the request shape, returning `undefined`
 * when it cannot be determined (so the caller can fall back to EIP-1559 network
 * detection).
 */
function getRequestType(request: Record<string, any>): string | undefined {
  if (request.authorizationList !== undefined) return 'eip7702'
  if (
    request.blobs !== undefined ||
    request.blobVersionedHashes !== undefined ||
    request.sidecars !== undefined ||
    request.maxFeePerBlobGas !== undefined
  )
    return 'eip4844'
  if (
    request.maxFeePerGas !== undefined ||
    request.maxPriorityFeePerGas !== undefined
  )
    return 'eip1559'
  if (request.gasPrice !== undefined)
    return request.accessList !== undefined ? 'eip2930' : 'legacy'
  return undefined
}

/**
 * Returns `true` when the error (or a nested `cause`) signals that the node
 * does not implement `eth_fillTransaction`. The error is a raw ox
 * `RpcResponse.*Error` (no `Errors.BaseError.walk`), so the `cause` chain is
 * walked by hand.
 */
function isUnsupportedFill(error: unknown): boolean {
  let current: unknown = error
  while (current && typeof current === 'object') {
    const e = current as { code?: unknown; message?: unknown; cause?: unknown }
    if (e.code === -32601 || e.code === -32004) return true
    const message = String(e.message)
    if (
      message.includes('eth_fillTransaction is not available') ||
      message.includes('does not exist') ||
      /method .*not (found|supported|available)/i.test(message)
    )
      return true
    current = e.cause
  }
  return false
}

type DefaultParameter = (typeof defaultParameters)[number]

type ResolvedParameters<options> = options extends {
  parameters: infer parameters extends readonly prepare.Parameter[]
}
  ? parameters[number]
  : DefaultParameter

type HasParam<options, parameter extends prepare.Parameter> =
  parameter extends ResolvedParameters<options> ? true : false

type HasDefined<options, key extends string> = options extends {
  [_ in key]: infer value
}
  ? [Exclude<value, undefined>] extends [never]
    ? false
    : true
  : false

type ResolvedAccount<account, options> = options extends {
  account: infer account_
}
  ? account_
  : account

type AccountFields<
  account,
  options,
  resolved = ResolvedAccount<account, options>,
> = [Exclude<resolved, undefined>] extends [never]
  ? { account?: undefined; from?: Address.Address | undefined }
  : { account: Exclude<resolved, undefined>; from: Address.Address }

type FeeFields<options, type extends string> =
  HasParam<options, 'fees'> extends true
    ? type extends 'legacy' | 'eip2930'
      ? { gasPrice: bigint; maxFeePerGas?: never; maxPriorityFeePerGas?: never }
      : { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint; gasPrice?: never }
    : {}

type BlobFields<options> =
  HasDefined<options, 'blobs'> extends true
    ? (HasParam<options, 'blobVersionedHashes'> extends true
        ? { blobVersionedHashes: readonly Hex.Hex[] }
        : {}) &
        (HasParam<options, 'sidecars'> extends true
          ? { sidecars: TxEnvelopeEip4844.Sidecars<Hex.Hex> }
          : {})
    : {}

type InferType<options> = options extends { type: infer type extends string }
  ? type
  : HasDefined<options, 'authorizationList'> extends true
    ? 'eip7702'
    : HasDefined<options, 'blobs'> extends true
      ? 'eip4844'
      : HasDefined<options, 'blobVersionedHashes'> extends true
        ? 'eip4844'
        : HasDefined<options, 'sidecars'> extends true
          ? 'eip4844'
          : HasDefined<options, 'maxFeePerBlobGas'> extends true
            ? 'eip4844'
            : HasDefined<options, 'maxFeePerGas'> extends true
              ? 'eip1559'
              : HasDefined<options, 'maxPriorityFeePerGas'> extends true
                ? 'eip1559'
                : HasDefined<options, 'gasPrice'> extends true
                  ? HasDefined<options, 'accessList'> extends true
                    ? 'eip2930'
                    : 'legacy'
                  : 'eip1559'

type RequiredFields<
  options,
  type extends string = InferType<options>,
> = (HasParam<options, 'chainId'> extends true ? { chainId: number } : {}) &
  (HasParam<options, 'gas'> extends true ? { gas: bigint } : {}) &
  (HasParam<options, 'nonce'> extends true ? { nonce: number } : {}) &
  (HasParam<options, 'type'> extends true
    ? { type: type }
    : { type?: type | undefined }) &
  FeeFields<options, type> &
  BlobFields<options>

type PreparedRequest<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  options extends prepare.Options<chain>,
> = Compute<
  Omit<options, 'account' | 'chain' | 'nonceManager' | 'parameters'> &
    AccountFields<account, options> &
    RequiredFields<options>
>

/** Thrown when `maxFeePerGas` is lower than the estimated priority fee. */
export class MaxFeePerGasTooLowError extends BaseError {
  override readonly name = 'TransactionPrepare.MaxFeePerGasTooLowError'

  constructor({ maxPriorityFeePerGas }: { maxPriorityFeePerGas: bigint }) {
    super(
      `\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${Value.formatGwei(
        maxPriorityFeePerGas,
      )} gwei).`,
    )
  }
}
