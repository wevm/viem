import { mkdirSync } from 'node:fs'

type Address = `0x${string}`

type Chain = {
  id: number
  name: string
  testnet?: boolean | undefined
}

type TokenLookupChain = {
  address: Address
  id: number
  name: string
}

type TokenLookupToken = {
  chains: TokenLookupChain[]
  currency?: string | undefined
  decimals: number
  importName: string
  name: string
  popular?: boolean | undefined
  symbol: string
}

type Token = {
  addresses: Record<number, Address>
  currency?: string | undefined
  decimals: number
  name?: string | undefined
  popular?: boolean | undefined
  symbol?: string | undefined
}

const chainsPath = new URL('../src/chains/index.ts', import.meta.url).href
const tokensPath = new URL('../src/tokens/index.ts', import.meta.url).href

const Chains = (await import(chainsPath)) as Record<string, unknown>
const Tokens = (await import(tokensPath)) as Record<string, unknown>

const chainById = new Map<number, Chain>()
for (const chain of Object.values(Chains)) {
  if (!isChain(chain)) continue
  if (chain.testnet) continue
  if (chainById.has(chain.id)) continue
  chainById.set(chain.id, chain)
}

const tokenLookupData = Object.entries(Tokens)
  .filter((entry): entry is [string, Token] => {
    const [importName, token] = entry
    return importName !== 'defineToken' && isToken(token)
  })
  .map(([importName, token]) => getTokenLookupToken(importName, token))
  .filter((token) => token.chains.length > 0)
  .sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1
    return a.symbol.localeCompare(b.symbol)
  })

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
  readonly currency?: string | undefined
  readonly decimals: number
  readonly importName: string
  readonly name: string
  readonly popular?: boolean | undefined
  readonly symbol: string
}

export const tokenLookupData = ${JSON.stringify(tokenLookupData, null, 2)} as const satisfies readonly TokenLookupToken[]
`,
)

function getTokenLookupToken(
  importName: string,
  token: Token,
): TokenLookupToken {
  return {
    chains: getTokenLookupChains(token),
    ...(token.currency ? { currency: token.currency } : {}),
    decimals: token.decimals,
    importName,
    name: token.name ?? token.symbol ?? importName,
    ...(token.popular ? { popular: token.popular } : {}),
    symbol: token.symbol ?? importName,
  }
}

function getTokenLookupChains(token: Token) {
  return Object.entries(token.addresses)
    .flatMap(([chainId_, address]) => {
      const chainId = Number(chainId_)
      const chain = chainById.get(chainId)
      if (!chain) return []
      return [
        {
          address,
          id: chain.id,
          name: chain.name,
        },
      ]
    })
    .sort((a, b) => a.id - b.id)
}

function isToken(value: unknown): value is Token {
  return (
    typeof value === 'function' &&
    'addresses' in value &&
    typeof value.addresses === 'object' &&
    value.addresses !== null &&
    'decimals' in value &&
    typeof value.decimals === 'number'
  )
}

function isChain(value: unknown): value is Chain {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    Number.isInteger(value.id) &&
    'name' in value &&
    typeof value.name === 'string'
  )
}
