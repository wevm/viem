import type { Address } from 'abitype'
import { Hex } from 'ox'
import type { Transaction as core_Transaction } from 'ox/tempo'
import type { Client } from '../../../clients/createClient.js'
import type { Call } from '../../../types/calls.js'
import { formatUnits } from '../../../utils/unit/formatUnits.js'
import * as Addresses from '../../Addresses.js'
import * as Actions from '../../actions/index.js'
import * as ExecutionError from '../../ExecutionError.js'
import type * as Relay from '../../Relay.js'
import type * as Store from './cache.js'
import { resolveFeeToken, resolveTokenMetadata } from './feeToken.js'
import * as Plugin from './plugin.js'
import * as Request from './request.js'
import * as Utils from './utils.js'

export function create(options: Relay.autoSwap.Options): Relay.Plugin {
  return Plugin.from((next) =>
    Request.wrap(next, async (request, context) => {
      if (request.method !== 'eth_fillTransaction')
        return next(request, context.options)

      const transaction = Utils.normalizeFillTransactionRequest(
        request.params![0] as Record<string, unknown>,
      )
      const store = context.getStore(options.store)
      const autoSwap = { slippage: options.slippage ?? 0.05 }

      const result = await fill(context.client, {
        transaction,
        autoSwap,
        store,
        feeToken: transaction.feeToken as Address | undefined,
        resolveFeeToken: async (insufficientToken, minimumBalance) =>
          resolveFeeToken(context.client, {
            account: transaction.from as Address | undefined,
            exclude: insufficientToken,
            minimumBalance,
            store,
            tokens: (await context.getTokens()).filter(
              (token) =>
                token.toLowerCase() !== insufficientToken.toLowerCase(),
            ),
          }),
      })

      return Request.enrich(
        {
          ...result.result,
          [Request.swap]: result.swap,
          tx: Utils.formatTempoTransaction(
            result.transaction as core_Transaction.Transaction,
          ),
        },
        async () => {
          const metadata = await resolveAutoSwapMetadata(context.client, {
            autoSwap,
            store,
            swap: result.swap,
          })
          return { capabilities: metadata ? { autoSwap: metadata } : {} }
        },
      )
    }),
  )
}

// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function fill(client: Client, options: fill.Options) {
  const { autoSwap, feeToken, store, transaction: request } = options

  // Skip re-formatting if already in RPC format (e.g. from viem's fillTransaction).
  const format = (value: Record<string, unknown>) =>
    value.type === '0x76'
      ? value
      : Utils.formatFillTransactionRequest(client, value)

  // Retry with swaps prepended when a funded source token can cover the missing balance.
  async function fillWithSwap(insufficientToken: Address, deficit: bigint) {
    const maxAmountIn =
      deficit +
      (deficit * BigInt(Math.floor(autoSwap.slippage * 1_000_000))) / 1_000_000n
    const preferredBalance =
      feeToken && feeToken.toLowerCase() !== insufficientToken.toLowerCase()
        ? await Actions.token
            .getBalance(client, {
              account: request.from as Address,
              token: feeToken,
            })
            .then((balance) => balance.amount)
            .catch(() => undefined)
        : undefined
    const sourceToken =
      preferredBalance !== undefined && preferredBalance >= maxAmountIn
        ? feeToken
        : await options.resolveFeeToken?.(insufficientToken, maxAmountIn)
    if (
      !sourceToken ||
      sourceToken.toLowerCase() === insufficientToken.toLowerCase()
    )
      return null

    const originalCalls = (request.calls as Call[] | undefined) ?? []
    const swapCalls = buildSwapCalls(
      client,
      sourceToken,
      insufficientToken,
      deficit,
      maxAmountIn,
    )

    const result = await client.request({
      method: 'eth_fillTransaction',
      params: [
        format({
          ...request,
          calls: [...swapCalls, ...originalCalls],
        }) as never,
      ],
    })
    const sponsor = (result as { capabilities?: { sponsor?: unknown } })
      .capabilities?.sponsor as
      | { address: Address; name?: string; url?: string }
      | undefined
    const mergedTx = Utils.mergeCallsFromRequest(
      result.tx as Record<string, unknown>,
      {
        ...request,
        calls: [...swapCalls, ...originalCalls],
      },
    )
    return {
      result: result as unknown as Request.Result,
      transaction: Utils.normalizeTempoTransaction(mergedTx),
      sponsor,
      swap: {
        calls: swapCalls,
        tokenIn: sourceToken,
        tokenOut: insufficientToken,
        amountOut: deficit,
        maxAmountIn,
      },
    }
  }

  try {
    const formatted = format(request)
    const result = await client.request({
      method: 'eth_fillTransaction',
      params: [formatted as never],
    })
    const upstreamCapabilities = (
      result as { capabilities?: Record<string, unknown> }
    ).capabilities
    const sponsor = upstreamCapabilities?.sponsor as
      | { address: Address; name?: string; url?: string }
      | undefined
    // Upstream error capabilities contain a transaction stub. Throw the error so auto-swap can recover or the outer handler can report it without signing the stub.
    const upstreamError = upstreamCapabilities?.error as
      | { errorName?: string; message?: string; data?: `0x${string}` }
      | undefined
    if (upstreamError) {
      const synthetic = new Error(
        upstreamError.message ?? upstreamError.errorName ?? 'UpstreamRevert',
      )
      synthetic.name = 'UpstreamRevertError'
      ;(synthetic as { data?: `0x${string}` | undefined }).data =
        upstreamError.data
      throw synthetic
    }
    // Reconstruct a `swap` shape from upstream's `capabilities.autoSwap` so the
    // wallet relay's outer code can re-resolve autoSwap metadata locally —
    // otherwise upstream-driven swaps are silently dropped from the response.
    const swap = extractSwapFromCapabilities(upstreamCapabilities?.autoSwap)
    // The chain's `eth_fillTransaction` doesn't echo back `calls`, so merge
    // them in from the original request before normalizing: otherwise the
    // typed envelope built for sponsorship signing throws CallsEmptyError.
    const mergedTx = Utils.mergeCallsFromRequest(
      result.tx as Record<string, unknown>,
      request,
    )

    // Check pre-transaction fee balance: a fill can select a token the sender will acquire only during execution.
    if (!swap) {
      const fromAddress = request.from as Address | undefined
      const resolvedFeeToken = ((mergedTx.feeToken as Address | undefined) ??
        feeToken) as Address | undefined
      const gas = mergedTx.gas ? BigInt(mergedTx.gas as `0x${string}`) : 0n
      const maxFeePerGas = mergedTx.maxFeePerGas
        ? BigInt(mergedTx.maxFeePerGas as `0x${string}`)
        : 0n
      if (fromAddress && resolvedFeeToken && gas > 0n && maxFeePerGas > 0n) {
        const [balance, metadata] = await Promise.all([
          Actions.token
            .getBalance(client, {
              account: fromAddress,
              token: resolvedFeeToken,
            })
            .then((balance) => balance.amount)
            .catch(() => undefined),
          resolveTokenMetadata(client, {
            token: resolvedFeeToken,
            store,
          }).catch(() => undefined),
        ])
        if (metadata && balance !== undefined) {
          const scale = 10n ** BigInt(Math.max(0, 18 - metadata.decimals))
          const requiredFee = (gas * maxFeePerGas + scale - 1n) / scale
          if (balance < requiredFee) {
            // Preserve the successful fill when the additional fee-balance swap fails.
            const swapResult = await fillWithSwap(
              resolvedFeeToken,
              requiredFee - balance,
            ).catch(() => null)
            if (swapResult) return swapResult
          }
        }
      }
    }

    return {
      result: result as unknown as Request.Result,
      transaction: Utils.normalizeTempoTransaction(mergedTx),
      sponsor,
      ...(swap ? { swap } : {}),
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error

    const revert = ExecutionError.from(error)
    if (revert.errorName !== 'InsufficientBalance' || !revert.args) throw error

    const [available, required, token] = revert.args
    if (
      typeof available === 'undefined' ||
      typeof required === 'undefined' ||
      !token
    )
      throw error

    const swapResult = await fillWithSwap(
      token as Address,
      required - available,
    )
    if (!swapResult) throw error
    return swapResult
  }
}

declare namespace fill {
  type Options = {
    autoSwap: { slippage: number }
    feeToken?: Address | undefined
    store?: Store.Store | undefined
    resolveFeeToken?:
      | ((
          insufficientToken: Address,
          minimumBalance: bigint,
        ) => Promise<Address | undefined>)
      | undefined
    transaction: Record<string, unknown>
  }
}

// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function resolveAutoSwapMetadata(
  client: Client,
  options: resolveAutoSwapMetadata.Options,
) {
  const { autoSwap, store, swap } = options
  if (!swap) return undefined
  const [inMeta, outMeta] = await Promise.all([
    resolveTokenMetadata(client, { token: swap.tokenIn, store }),
    resolveTokenMetadata(client, { token: swap.tokenOut, store }),
  ])
  return {
    calls: swap.calls.map((c) => ({ to: c.to, data: c.data })),
    slippage: autoSwap.slippage,
    maxIn: {
      token: swap.tokenIn,
      value: Hex.fromNumber(swap.maxAmountIn) as `0x${string}`,
      formatted: formatUnits(swap.maxAmountIn, inMeta.decimals),
      decimals: inMeta.decimals,
      symbol: inMeta.symbol,
      name: inMeta.name,
    },
    minOut: {
      token: swap.tokenOut,
      value: Hex.fromNumber(swap.amountOut) as `0x${string}`,
      formatted: formatUnits(swap.amountOut, outMeta.decimals),
      decimals: outMeta.decimals,
      symbol: outMeta.symbol,
      name: outMeta.name,
    },
  }
}

declare namespace resolveAutoSwapMetadata {
  type Options = {
    autoSwap: { slippage: number }
    store?: Store.Store | undefined
    swap?:
      | {
          calls: readonly { to: Address; data: `0x${string}` }[]
          tokenIn: Address
          tokenOut: Address
          amountOut: bigint
          maxAmountIn: bigint
        }
      | undefined
  }
}

function buildSwapCalls(
  client: Client,
  sourceToken: Address,
  targetToken: Address,
  deficit: bigint,
  maxAmountIn: bigint,
) {
  const approve = Actions.token.approve.call(client, {
    token: sourceToken,
    spender: Addresses.stablecoinDex,
    amount: maxAmountIn,
  })
  const buy = Actions.dex.buy.call({
    tokenIn: sourceToken,
    tokenOut: targetToken,
    amountOut: deficit,
    maxAmountIn,
  })
  return [
    { to: approve.to, data: approve.data, value: 0n },
    { to: buy.to, data: buy.data, value: 0n },
  ] as const
}

/** Preserves upstream auto-swap information so forwarding relays can report the injected swap and resolve its metadata. */
export function extractSwapFromCapabilities(autoSwap: unknown):
  | {
      calls: readonly { to: Address; data: `0x${string}` }[]
      tokenIn: Address
      tokenOut: Address
      amountOut: bigint
      maxAmountIn: bigint
    }
  | undefined {
  if (!autoSwap || typeof autoSwap !== 'object') return undefined
  const a = autoSwap as {
    calls?: readonly { to: Address; data: `0x${string}` }[]
    maxIn?: { token?: Address; value?: `0x${string}` }
    minOut?: { token?: Address; value?: `0x${string}` }
  }
  if (
    !a.calls ||
    !a.maxIn?.token ||
    !a.maxIn.value ||
    !a.minOut?.token ||
    !a.minOut.value
  )
    return undefined
  return {
    calls: a.calls,
    tokenIn: a.maxIn.token,
    tokenOut: a.minOut.token,
    amountOut: BigInt(a.minOut.value),
    maxAmountIn: BigInt(a.maxIn.value),
  }
}
