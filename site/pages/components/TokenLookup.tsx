'use client'

import { type ReactNode, useMemo, useState } from 'react'
import { tokenLookupData } from '../../data/tokens.js'

type TokenEntry = {
  addresses: string[]
  chains: string[]
  decimals: number
  importName: string
  name: string
  popular: boolean
  searchText: string
  symbol: string
}

const popularTokens = new Set(['usdc'])

const tokens: TokenEntry[] = tokenLookupData
  .map((token) => {
    const addresses = token.chains.map((chain) => chain.address)
    const chains = token.chains.map((chain) => chain.name)
    const popular = popularTokens.has(token.importName)

    return {
      addresses,
      chains,
      decimals: token.decimals,
      importName: token.importName,
      name: token.name,
      popular,
      searchText: [
        token.symbol,
        token.name,
        token.importName,
        token.decimals,
        popular ? 'popular' : '',
        ...chains,
        ...addresses,
      ]
        .join(' ')
        .toLowerCase(),
      symbol: token.symbol,
    }
  })
  .sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1
    return a.symbol.localeCompare(b.symbol)
  })

export function TokenLookup() {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredTokens = useMemo(() => {
    if (!normalizedQuery) return tokens
    return tokens.filter((token) => token.searchText.includes(normalizedQuery))
  }, [normalizedQuery])
  const visibleTokens = showAll ? filteredTokens : filteredTokens.slice(0, 5)
  const hiddenTokenCount = filteredTokens.length - visibleTokens.length

  return (
    <section className="not-prose vocs:my-6">
      <label
        className="vocs:mb-2 vocs:block vocs:text-sm vocs:font-medium vocs:text-heading"
        htmlFor="token-lookup-search"
      >
        Search tokens
      </label>
      <div className="vocs:flex vocs:h-10 vocs:items-center vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surfaceTint/70 vocs:px-3">
        <input
          className="vocs:flex-1 vocs:bg-transparent vocs:text-sm vocs:text-heading vocs:placeholder:text-secondary vocs:outline-none"
          id="token-lookup-search"
          onChange={(event) => {
            setQuery(event.currentTarget.value)
            setShowAll(false)
          }}
          placeholder="Search by symbol, name, chain, address, or decimals"
          type="search"
          value={query}
        />
      </div>
      {filteredTokens.length > 0 && (
        <ul className="vocs:mt-4 vocs:mb-0 vocs:list-none vocs:overflow-hidden vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surfaceTint/70 vocs:p-0">
          {visibleTokens.map((token) => (
            <li
              className="vocs:grid vocs:grid-cols-1 vocs:items-start vocs:gap-x-3 vocs:gap-y-1 vocs:border-t vocs:border-primary vocs:px-3 vocs:py-2.5 vocs:transition-colors first:vocs:border-t-0 vocs:hover:bg-surfaceTint vocs:md:grid-cols-[minmax(0,1fr)_minmax(12rem,1.25fr)] vocs:md:items-center"
              key={token.importName}
            >
              <div className="vocs:order-1 vocs:flex vocs:min-w-0 vocs:flex-wrap vocs:items-baseline vocs:gap-x-2 vocs:gap-y-1">
                <code className="vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surface vocs:px-1.5 vocs:py-0.5 vocs:font-mono vocs:text-[13px] vocs:font-medium vocs:text-heading">
                  <HighlightedText
                    query={normalizedQuery}
                    text={token.symbol.toLowerCase()}
                  />
                </code>
                <span className="vocs:min-w-0 vocs:text-sm vocs:leading-relaxed vocs:text-secondary">
                  <HighlightedText query={normalizedQuery} text={token.name} />
                </span>
                {token.popular && (
                  <span className="vocs:rounded-md vocs:bg-info-tint vocs:px-1.5 vocs:py-0.5 vocs:text-[11px] vocs:font-medium vocs:leading-none vocs:text-info">
                    Popular
                  </span>
                )}
              </div>
              <ChainSummary chains={token.chains} query={normalizedQuery} />
            </li>
          ))}
          {hiddenTokenCount > 0 && (
            <li className="vocs:border-t vocs:border-primary">
              <button
                className="vocs:block vocs:w-full vocs:cursor-pointer vocs:px-3 vocs:py-2 vocs:text-left vocs:text-xs vocs:font-medium vocs:text-link vocs:transition-colors vocs:hover:bg-surfaceTint vocs:hover:text-heading"
                onClick={() => setShowAll(true)}
                type="button"
              >
                Show all
              </button>
            </li>
          )}
        </ul>
      )}
      {filteredTokens.length === 0 && (
        <div className="vocs:mt-4 vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surfaceTint/70 vocs:p-4 vocs:text-sm vocs:text-secondary">
          No tokens found.
        </div>
      )}
    </section>
  )
}

function ChainSummary({ chains, query }: { chains: string[]; query: string }) {
  const [expanded, setExpanded] = useState(false)
  const hiddenChains = chains.slice(2)
  const expandsForSearch =
    Boolean(query) &&
    hiddenChains.some((chain) => chain.toLowerCase().includes(query))
  const visibleChains =
    expanded || expandsForSearch ? chains : chains.slice(0, 2)
  const hiddenChainCount = chains.length - visibleChains.length

  return (
    <span className="vocs:order-2 vocs:flex vocs:min-w-0 vocs:flex-wrap vocs:items-center vocs:justify-end vocs:gap-x-1.5 vocs:gap-y-1 vocs:text-right vocs:text-xs vocs:leading-relaxed vocs:text-muted">
      {visibleChains.map((chain, index) => (
        <span className="vocs:min-w-0" key={chain}>
          <HighlightedText query={query} text={chain} />
          {index < visibleChains.length - 1 ? ',' : ''}
        </span>
      ))}
      {hiddenChainCount > 0 && (
        <button
          className="vocs:shrink-0 vocs:cursor-pointer vocs:text-link vocs:hover:text-heading"
          onClick={() => setExpanded(true)}
          type="button"
        >
          + {hiddenChainCount} {hiddenChainCount === 1 ? 'other' : 'others'}
        </button>
      )}
    </span>
  )
}

function HighlightedText({ query, text }: { query: string; text: string }) {
  if (!query) return text

  const normalizedText = text.toLowerCase()
  const parts: ReactNode[] = []
  let cursor = 0
  let matchIndex = normalizedText.indexOf(query)

  if (matchIndex === -1) return text

  while (matchIndex !== -1) {
    if (matchIndex > cursor) parts.push(text.slice(cursor, matchIndex))

    const end = matchIndex + query.length
    parts.push(
      <mark
        className="vocs:rounded-sm vocs:px-0.5"
        key={`${matchIndex}-${end}`}
        style={{
          backgroundColor: 'var(--vocs-color-accenta4)',
          color: 'var(--vocs-color-accent)',
        }}
      >
        {text.slice(matchIndex, end)}
      </mark>,
    )

    cursor = end
    matchIndex = normalizedText.indexOf(query, cursor)
  }

  if (cursor < text.length) parts.push(text.slice(cursor))

  return <>{parts}</>
}
