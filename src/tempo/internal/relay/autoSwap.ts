import type { Address } from 'abitype'
import { Hex } from 'ox'
import { formatUnits } from '../../../utils/unit/formatUnits.js'
import * as Actions from '../../actions/index.js'
import * as ExecutionError from '../../ExecutionError.js'
import type * as Relay from '../../Relay.js'
import { isExecutionError } from './error.js'
import { resolveTokenMetadata } from './feeToken.js'

export function create(options: Relay.autoSwap.Options): Relay.Plugin {
  const slippage = options.slippage ?? 0.05
  if (!Number.isFinite(slippage) || slippage < 0 || slippage > 1)
    throw new RangeError('Expected `slippage` between 0 and 1.')
  // Per-mille precision keeps the maximum input exact in integer math.
  const permille = BigInt(Math.round(slippage * 1_000))
  return {
    async handleRequest(context, next) {
      if (context.request.method !== 'eth_fillTransaction') return next()
      try {
        await next()
      } catch (error) {
        const parameters = context.request.params![0] as Record<string, unknown>
        const deficit = parseDeficit(error)
        const from = parameters.from as Address | undefined
        if (!deficit || !from) throw error

        const maxAmountIn =
          deficit.amount + (deficit.amount * permille) / 1_000n
        const tokenIn = await selectTokenIn(context, {
          account: from,
          amountOut: deficit.amount,
          exclude: deficit.token,
          feeToken: parameters.feeToken as Address | undefined,
          maxAmountIn,
        })
        if (!tokenIn) throw error

        // The stablecoin DEX debits the sender directly, so the swap needs no allowance.
        const buy = Actions.dex.buy.call({
          amountOut: deficit.amount,
          maxAmountIn,
          tokenIn,
          tokenOut: deficit.token,
        })
        const swap = [{ data: buy.data, to: buy.to, value: '0x0' }]
        const { calls: _, data: __, to: ___, value: ____, ...rest } = parameters
        const calls = [...swap, ...getCalls(parameters)]
        // `next()` may run once, so the swap refills through the downstream client.
        const result = (await context.client
          .request({
            method: 'eth_fillTransaction',
            params: [{ ...rest, calls }],
          } as never)
          .catch(() => {
            throw error
          })) as Relay.Plugin.FillResult
        const tx = result.tx as Record<string, unknown>
        const capability: Capability = {
          calls: swap.map(({ data, to }) => ({ data, to })),
          maxIn: { token: tokenIn, value: Hex.fromNumber(maxAmountIn) },
          minOut: {
            token: deficit.token,
            value: Hex.fromNumber(deficit.amount),
          },
          slippage,
        }
        return {
          ...result,
          // Replaced by `afterFill` with token metadata.
          capabilities: { ...result.capabilities, autoSwap: capability },
          // Nodes may omit filled calls; outer plugins would otherwise restore the unswapped request.
          tx:
            Array.isArray(tx.calls) && tx.calls.length > 0
              ? tx
              : { ...tx, calls },
        }
      }
    },
    async afterFill(filled, context) {
      const capability = filled.capabilities?.autoSwap as Capability | undefined
      if (!capability) return undefined
      const store = context.getStore(options.store)
      const [metadata_in, metadata_out] = await Promise.all(
        [capability.maxIn.token, capability.minOut.token].map((token) =>
          resolveTokenMetadata(context.client, { store, token }).catch(
            () => undefined,
          ),
        ),
      )
      // Without both tokens' metadata the swap still executes, but cannot be described.
      if (!metadata_in || !metadata_out)
        return { capabilities: { autoSwap: undefined } }
      return {
        capabilities: {
          autoSwap: {
            calls: capability.calls,
            maxIn: describe(capability.maxIn, metadata_in),
            minOut: describe(capability.minOut, metadata_out),
            slippage: capability.slippage,
          },
        },
      }
    },
  }
}

/** Swap facts carried from the fill to `afterFill` in the response capability. */
type Capability = {
  calls: readonly { data: Hex.Hex; to: Address }[]
  maxIn: { token: Address; value: Hex.Hex }
  minOut: { token: Address; value: Hex.Hex }
  slippage: number
}

/** Returns the missing token and amount of an `InsufficientBalance` revert. */
function parseDeficit(error: unknown) {
  if (!isExecutionError(error)) return undefined
  const revert = ExecutionError.from(error)
  if (revert.errorName !== 'InsufficientBalance' || revert.args?.length !== 3)
    return undefined
  const [available, required, token] = revert.args
  if (required <= available) return undefined
  return { amount: required - available, token }
}

/**
 * Returns the first funded token that the DEX can sell for the missing amount within `maxAmountIn`,
 * trying the named fee token and the sender's preferred token before the best-funded candidates.
 */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function selectTokenIn(
  context: Relay.Plugin.Context,
  options: selectTokenIn.Options,
) {
  const { account, amountOut, exclude, feeToken, maxAmountIn } = options
  // A speculative sponsored fill names the sponsor's token, so the sender's own preference also ranks first.
  const [preference, tokens] = await Promise.all([
    Actions.fee
      .getUserToken(context.client, { account })
      .then((token) => token?.address)
      .catch(() => undefined),
    context.resolveTokens(),
  ])
  const preferred = [feeToken, preference].flatMap((token) =>
    token ? [token.toLowerCase() as Address] : [],
  )
  const candidates = [
    ...new Set([
      ...preferred,
      ...tokens.map((token) => token.toLowerCase() as Address),
    ]),
  ]
    .filter((token) => token !== exclude.toLowerCase())
    // Bounds reads for one fill, matching the fee-token candidate limit.
    .slice(0, 100)
  const balances = await Promise.all(
    candidates.map(async (token) => ({
      balance: await Actions.token
        .getBalance(context.client, { account, token })
        .then(({ amount }) => amount)
        .catch(() => 0n),
      token,
    })),
  )
  const funded = balances
    .filter(({ balance }) => balance >= maxAmountIn)
    .sort((a, b) => {
      const rank = (token: Address) => {
        const index = preferred.indexOf(token)
        return index === -1 ? preferred.length : index
      }
      if (rank(a.token) !== rank(b.token)) return rank(a.token) - rank(b.token)
      return a.balance === b.balance ? 0 : a.balance > b.balance ? -1 : 1
    })
  // Quotes fail for tokens without a DEX route or enough liquidity.
  const quotes = await Promise.all(
    funded.map(({ token }) =>
      Actions.dex
        .getBuyQuote(context.client, {
          amountOut,
          tokenIn: token,
          tokenOut: exclude,
        })
        .catch(() => undefined),
    ),
  )
  return funded.find(
    (_, index) => quotes[index] !== undefined && quotes[index] <= maxAmountIn,
  )?.token
}

declare namespace selectTokenIn {
  type Options = {
    /** Sender whose balances fund the swap. */
    account: Address
    /** Missing amount of the token being bought. */
    amountOut: bigint
    /** Token being bought. */
    exclude: Address
    /** Fee token the fill names, preferred when funded. */
    feeToken?: Address | undefined
    /** Largest accepted input, which the sender's balance must also cover. */
    maxAmountIn: bigint
  }
}

/** Returns the request's calls, including a legacy single call. */
function getCalls(parameters: Record<string, unknown>): readonly unknown[] {
  if (Array.isArray(parameters.calls)) return parameters.calls
  const { data, to, value } = parameters
  if (to === undefined && data === undefined && value === undefined) return []
  return [
    {
      ...(to !== undefined ? { to } : {}),
      ...(data !== undefined ? { data } : {}),
      ...(value !== undefined ? { value } : {}),
    },
  ]
}

/** Formats one side of a swap with its token metadata. */
function describe(
  amount: Capability['maxIn'],
  metadata: { decimals: number; name: string; symbol: string },
) {
  return {
    decimals: metadata.decimals,
    formatted: formatUnits(Hex.toBigInt(amount.value), metadata.decimals),
    name: metadata.name,
    symbol: metadata.symbol,
    token: amount.token,
    value: amount.value,
  }
}
