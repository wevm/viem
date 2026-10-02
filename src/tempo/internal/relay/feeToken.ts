import type { Address } from 'abitype'
import { RpcResponse } from 'ox'
import type { Client } from '../../../clients/createClient.js'
import { tokens as tokenSets } from '../../../tokens/sets.js'
import * as Actions from '../../actions/index.js'
import type * as Relay from '../../Relay.js'
import * as Store from './cache.js'
import * as Preflight from './preflight.js'
import * as Utils from './utils.js'
import { extractCalls, getVirtualAddressTargets } from './virtualAddress.js'

export function create(): Relay.Plugin {
  return {
    async handleRequest(context, next) {
      const { request } = context
      if (request.method !== 'eth_fillTransaction') return next()
      const parameters = request.params![0] as Record<string, unknown>
      const transaction = Utils.normalizeFillTransactionRequest(parameters)

      if (transaction.feeToken) {
        context.request = {
          ...request,
          params: [
            Utils.formatFillTransactionRequest(context.client, transaction),
          ],
        }
        return next()
      }

      const tokens = await context.resolveTokens()
      const candidates = [
        ...tokens,
        ...callTargetTokens(transaction).filter(
          (token) =>
            !tokens.some(
              (candidate) => candidate.toLowerCase() === token.toLowerCase(),
            ),
        ),
      ]

      const resolved = transaction.feePayer
        ? { feeToken: tokens[0], virtualAddresses: undefined }
        : await resolveFeeToken(context.client, {
            account: transaction.from as Address | undefined,
            feeToken: transaction.feeToken as Address | undefined,
            targets: getVirtualAddressTargets(extractCalls(transaction)),
            tokens: candidates,
          })

      const { feeToken, virtualAddresses } = resolved
      const selected = { ...transaction, ...(feeToken ? { feeToken } : {}) }
      context.request = {
        ...request,
        params: [Utils.formatFillTransactionRequest(context.client, selected)],
      }
      await next()
      const result = context.result as Relay.Plugin.FillResult
      context.result = {
        ...result,
        // Unsigned sponsored estimates can omit the fee token selected by this plugin.
        tx: {
          ...result.tx,
          ...(!result.tx.feeToken && feeToken ? { feeToken } : {}),
        },
        ...(virtualAddresses
          ? { capabilities: { ...result.capabilities, virtualAddresses } }
          : {}),
      }
    },
  }
}

export async function getDefaultTokens(
  chainId: number,
): Promise<readonly Address[]> {
  return tokenSets.tempo.flatMap((token) => {
    const address = (token.addresses as Record<number, Address>)[chainId]
    return address ? [address] : []
  })
}

/** Resolves a funded fee-token candidate with fee AMM liquidity. @internal */
export async function resolveFeeToken(
  client: Client,
  options: resolveFeeToken.Options,
) {
  const { feeToken, account, exclude, tokens } = options
  if (feeToken || !account) return { feeToken, virtualAddresses: undefined }
  const candidates = [
    ...new Set(tokens?.map((token) => token.toLowerCase() as Address)),
  ]
  if (candidates.length > 100)
    throw new RpcResponse.InvalidParamsError({
      message: 'Fee-token candidates exceed the limit of 100 tokens.',
    })
  const { preferredToken, preferredBalance, balances, virtualAddresses } =
    await Preflight.read(client, {
      account,
      tokens: candidates,
      targets: options.targets,
    })
  const minimumBalance = options.minimumBalance ?? 1n
  if (
    preferredToken.toLowerCase() !== exclude?.toLowerCase() &&
    preferredBalance >= minimumBalance
  )
    return { feeToken: preferredToken, virtualAddresses }

  let best: { address: Address; balance: bigint } | undefined
  for (const asset of balances) {
    if (
      asset.balance < minimumBalance ||
      asset.address.toLowerCase() === exclude?.toLowerCase()
    )
      continue
    if (!best || asset.balance > best.balance) best = asset
  }
  return { feeToken: best?.address, virtualAddresses }
}

export declare namespace resolveFeeToken {
  type Options = {
    minimumBalance?: bigint | undefined
    exclude?: Address | undefined
    feeToken?: Address | undefined
    account?: Address | undefined
    tokens?: readonly Address[] | undefined
    targets?: readonly Address[] | undefined
  }
}

/** Includes call-target TIP20 tokens as fee candidates, allowing transfers to pay fees with the transferred token. */
function callTargetTokens(
  transaction: Record<string, unknown>,
): readonly Address[] {
  const calls = transaction.calls as readonly { to?: Address }[] | undefined
  if (!calls) return []
  const out: Address[] = []
  const seen = new Set<string>()
  for (const c of calls) {
    if (!c.to) continue
    const lower = c.to.toLowerCase()
    if (!lower.startsWith('0x20c0')) continue
    if (seen.has(lower)) continue
    seen.add(lower)
    out.push(c.to)
    if (out.length > 100)
      throw new RpcResponse.InvalidParamsError({
        message: 'Fee-token candidates exceed the limit of 100 tokens.',
      })
  }
  return out
}

export async function resolveTokenMetadata(
  client: Client,
  options: resolveTokenMetadata.Options,
) {
  const { token, tokenMetadata, store } = options
  const meta =
    tokenMetadata?.[token] ?? tokenMetadata?.[token.toLowerCase() as Address]
  // Tempo simulation metadata covers TIP-20 tokens, whose decimals are always six.
  if (token.toLowerCase().startsWith('0x20c0') && meta)
    return { decimals: 6, symbol: meta.symbol, name: meta.name }
  // TIP-20 metadata (decimals/symbol/name) is immutable per token, so cache
  // long-term. Skips the multicall RPC on cache hits.
  const fetcher = () => Actions.token.getMetadata(client, { token })
  const fallback = store
    ? await Store.memoize(fetcher, {
        key: `tokenMetadata:${client.chain?.id ?? 0}:${token.toLowerCase()}`,
        store,
        ttl: 24 * 60 * 60 * 1000,
      })
    : await fetcher()
  return {
    decimals: fallback.decimals ?? 6,
    symbol: meta?.symbol || fallback.symbol,
    name: meta?.name || fallback.name,
  }
}

export declare namespace resolveTokenMetadata {
  type Options = {
    token: Address
    tokenMetadata?:
      | Record<Address, { name: string; symbol: string; currency: string }>
      | undefined
    store?: Store.Store | undefined
  }
}
