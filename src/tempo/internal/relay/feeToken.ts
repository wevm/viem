import type { Address } from 'abitype'
import { tempo, tempoModerato } from '../../../chains/index.js'
import type { Client } from '../../../clients/createClient.js'
import * as Actions from '../../actions/index.js'
import type * as Relay from '../../Relay.js'
import * as Store from './cache.js'
import * as Plugin from './plugin.js'
import * as Request from './request.js'
import * as Utils from './utils.js'

export function create(options: Relay.feeToken.Options): Relay.Plugin {
  return Plugin.from(
    (next) =>
      Request.wrap(next, async (request, context) => {
        if (request.method !== 'eth_fillTransaction')
          return next(request, context.options)

        const parameters = request.params![0] as Record<string, unknown>
        const transaction = Utils.normalizeFillTransactionRequest(parameters)

        const tokens = await resolveTokens(
          context.chainId!,
          context.options.signal,
        )
        const candidates = [
          ...tokens,
          ...callTargetTokens(transaction).filter(
            (token) =>
              !tokens.some(
                (candidate) => candidate.toLowerCase() === token.toLowerCase(),
              ),
          ),
        ]

        const feeToken = transaction.feePayer
          ? (transaction.feeToken ?? tokens[0])
          : await resolveFeeToken(context.client, {
              account: transaction.from as Address | undefined,
              feeToken: transaction.feeToken as Address | undefined,
              store: Store.scoped(options.cache),
              tokens: candidates,
            })

        return Request.fill(context.client, {
          ...transaction,
          ...(feeToken ? { feeToken } : {}),
        })
      }),
    { resolveTokens },
  )

  async function resolveTokens(chainId: number, signal?: AbortSignal) {
    if (options.resolveTokens) return options.resolveTokens(chainId)
    return getDefaultTokens(chainId, signal, options.apiKey)
  }
}

export async function getDefaultTokens(
  chainId: number,
  signal?: AbortSignal,
  apiKey?: string,
): Promise<readonly Address[]> {
  if (chainId !== tempo.id && chainId !== tempoModerato.id) return []

  const url = new URL('https://api.tempo.xyz/v1/tokenlist')
  url.searchParams.set('chainId', String(chainId))
  const response = await fetch(url, {
    ...(signal ? { signal } : {}),
    ...(apiKey ? { headers: { 'tempo-api-key': apiKey } } : {}),
  })
  if (response.status !== 200) return []

  const body = (await response.json()) as { tokens: { address: Address }[] }
  return body.tokens.map((token) => token.address)
}

export async function resolveFeeToken(
  client: Client,
  options: resolveFeeToken.Options,
): Promise<Address | undefined> {
  const { feeToken, account, store, tokens } = options
  if (feeToken) return feeToken
  if (!account) return undefined

  // Cache the preference briefly; always check current balances before selecting it.
  const getUserToken = () =>
    Actions.fee.getUserToken(client, { account }).catch(() => null)
  const userTokenPromise = store
    ? Store.memoize(
        async () => {
          const result = await getUserToken()
          return result ? { address: result.address } : null
        },
        {
          key: `fee.userToken:${client.chain?.id ?? 0}:${account.toLowerCase()}`,
          store,
          ttl: (options.userTokenCacheTtl ?? 60) * 1000,
        },
      )
    : getUserToken()

  const [userToken, balances] = await Promise.all([
    userTokenPromise,
    tokens
      ? Promise.all(
          tokens.map(async (token) => ({
            address: token,
            balance: await Actions.token
              .getBalance(client, { account, token })
              .then((balance) => balance.amount)
              .catch(() => 0n),
          })),
        )
      : [],
  ])

  // If on-chain preference is set and user has balance, use it.
  if (userToken) {
    const match = balances.find(
      (b: { address: Address; balance: bigint }) =>
        b.address.toLowerCase() === userToken.address.toLowerCase() &&
        b.balance > 0n,
    )
    if (match) return userToken.address

    // Token list may not include the preference: check on-chain directly.
    if (!match) {
      try {
        const { amount: balance } = await Actions.token.getBalance(client, {
          account,
          token: userToken.address,
        })
        if (balance > 0n) return userToken.address
      } catch {}
    }
  }

  // Pick the token with the highest balance.
  let best: { address: Address; balance: bigint } | undefined
  for (const asset of balances) {
    if (asset.balance <= 0n) continue
    if (!best || asset.balance > best.balance) best = asset
  }
  if (best) return best.address
  return undefined
}

export declare namespace resolveFeeToken {
  type Options = {
    feeToken?: Address | undefined
    account?: Address | undefined
    store?: Store.Store | undefined
    tokens?: readonly Address[] | undefined
    /** TTL in seconds for the cached `userTokens` lookup. @default 60 */
    userTokenCacheTtl?: number | undefined
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
