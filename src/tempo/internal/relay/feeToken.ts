import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import * as Actions from '../../actions/index.js'
import * as Store from './cache.js'

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
export function callTargetTokens(
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
