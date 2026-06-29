import { mkdirSync } from 'node:fs'

type ChainToken = {
  address: string
  decimals: number
  name?: string | undefined
  symbol?: string | undefined
}

type ChainWithTokens = {
  id: number
  name: string
  testnet?: boolean | undefined
  tokens: Record<string, ChainToken>
}

type TokenGroup = {
  chains: {
    address: string
    id: number
    name: string
  }[]
  decimals: number
  importName: string
  name: string
  symbol: string
}

const tokenGroups = new Map<string, TokenGroup>()
const seenChainTokens = new Set<string>()
const chainsPath = new URL('../src/chains/index.ts', import.meta.url).href
const Chains = (await import(chainsPath)) as Record<string, unknown>

for (const chain of Object.values(Chains)) {
  if (!isChainWithTokens(chain)) continue
  if (chain.testnet) continue

  for (const [tokenKey, token] of Object.entries(chain.tokens)) {
    const symbol = token.symbol ?? tokenKey
    const name = token.name ?? symbol
    const groupKey = `${tokenKey}:${symbol.toLowerCase()}:${name.toLowerCase()}:${token.decimals}`
    const chainTokenKey = `${chain.id}:${groupKey}:${token.address.toLowerCase()}`
    if (seenChainTokens.has(chainTokenKey)) continue
    seenChainTokens.add(chainTokenKey)

    const group = tokenGroups.get(groupKey) ?? {
      chains: [],
      decimals: token.decimals,
      importName: tokenKey,
      name,
      symbol,
    }
    group.chains.push({
      address: token.address,
      id: chain.id,
      name: chain.name,
    })
    tokenGroups.set(groupKey, group)
  }
}

const tokenLookupData = Array.from(tokenGroups.values())
  .map((token) => ({
    ...token,
    chains: token.chains.sort((a, b) => a.id - b.id),
  }))
  .sort((a, b) => a.symbol.localeCompare(b.symbol))

const output = new URL('../site/data/tokens.ts', import.meta.url)
mkdirSync(new URL('.', output), { recursive: true })

await Bun.write(
  output,
  `// Generated with \`pnpm gen:token-lookup\`. Do not modify manually.

export type TokenLookupChain = {
  readonly address: string
  readonly id: number
  readonly name: string
}

export type TokenLookupToken = {
  readonly chains: readonly TokenLookupChain[]
  readonly decimals: number
  readonly importName: string
  readonly name: string
  readonly symbol: string
}

export const tokenLookupData = ${JSON.stringify(tokenLookupData, null, 2)} as const satisfies readonly TokenLookupToken[]
`,
)

function isChainWithTokens(value: unknown): value is ChainWithTokens {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'tokens' in value &&
    typeof value.tokens === 'object' &&
    value.tokens !== null &&
    Object.keys(value.tokens).length > 0
  )
}
