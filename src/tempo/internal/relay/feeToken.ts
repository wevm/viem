import type { Address } from 'abitype'
import { RpcResponse } from 'ox'
import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import { tokens as tokenSets } from '../../../tokens/sets.js'
import * as Actions from '../../actions/index.js'
import type * as Relay from '../../Relay.js'
import * as Store from './cache.js'
import * as Request from './request.js'
import * as Utils from './utils.js'

export function create(options: Relay.feeToken.Options): Relay.Plugin {
  return {
    async handleRequest(context, next) {
      const { request } = context
      if (request.method !== 'eth_fillTransaction') return next()
      const parameters = request.params![0] as Record<string, unknown>
      const transaction = Utils.normalizeFillTransactionRequest(parameters)

      if (transaction.feeToken) return Request.fill(context.client, transaction)

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

      const feeToken = transaction.feePayer
        ? (transaction.feeToken ?? tokens[0])
        : await resolveFeeToken(context.client, {
            account: transaction.from as Address | undefined,
            feeToken: transaction.feeToken as Address | undefined,
            store: context.getStore(options.store),
            tokens: candidates,
          })

      return Request.fill(context.client, {
        ...transaction,
        ...(feeToken ? { feeToken } : {}),
      })
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

/** Resolves a funded fee-token candidate. @internal */
export async function resolveFeeToken(
  client: Client,
  options: resolveFeeToken.Options,
): Promise<Address | undefined> {
  const { feeToken, account, exclude, store, tokens } = options
  if (feeToken) return feeToken
  if (!account) return undefined

  const candidates = [
    ...new Set(tokens?.map((token) => token.toLowerCase() as Address)),
  ]
  if (candidates.length > 100)
    throw new RpcResponse.InvalidParamsError({
      message: 'Fee-token candidates exceed the limit of 100 tokens.',
    })
  const minimumBalance = options.minimumBalance ?? 1n

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
    (async () => {
      const balances = new Array<{ address: Address; balance: bigint }>(
        candidates.length,
      )
      let index = 0
      await Promise.all(
        Array.from({ length: Math.min(10, candidates.length) }, async () => {
          while (index < candidates.length) {
            const current = index++
            const token = candidates[current]!
            balances[current] = {
              address: token,
              balance: await readContract(
                client,
                Actions.token.getBalance.call(client, { account, token }),
              ).catch(() => 0n),
            }
          }
        }),
      )
      return balances
    })(),
  ])

  // If on-chain preference is set and user has balance, use it.
  if (userToken && userToken.address.toLowerCase() !== exclude?.toLowerCase()) {
    const match = balances.find(
      (b: { address: Address; balance: bigint }) =>
        b.address.toLowerCase() === userToken.address.toLowerCase(),
    )
    if (match && match.balance >= minimumBalance) return userToken.address

    // Token list may not include the preference: check on-chain directly.
    if (!match) {
      try {
        const balance = await readContract(
          client,
          Actions.token.getBalance.call(client, {
            account,
            token: userToken.address,
          }),
        )
        if (balance >= minimumBalance) return userToken.address
      } catch {}
    }
  }

  // Pick the token with the highest balance.
  let best: { address: Address; balance: bigint } | undefined
  for (const asset of balances) {
    if (
      asset.balance < minimumBalance ||
      asset.address.toLowerCase() === exclude?.toLowerCase()
    )
      continue
    if (!best || asset.balance > best.balance) best = asset
  }
  if (best) return best.address
  return undefined
}

export declare namespace resolveFeeToken {
  type Options = {
    minimumBalance?: bigint | undefined
    exclude?: Address | undefined
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
