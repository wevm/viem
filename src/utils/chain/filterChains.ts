import type { ErrorType } from '../../errors/utils.js'
import type { Token } from '../../tokens/defineToken.js'
import type { Chain } from '../../types/chain.js'

export type FilterChainsParameters<
  criteria extends filterChains.Criteria = filterChains.Criteria,
> = {
  chains: filterChains.Chains
} & criteria

export type FilterChainsReturnType<
  criteria extends filterChains.Criteria | undefined,
> = (Chain &
  filterChains.TokenConstraint<criteria> &
  filterChains.TestnetConstraint<criteria>)[]

export type FilterChainsErrorType = ErrorType

/**
 * Filters a chain registry or array by structured criteria.
 *
 * @experimental
 *
 * @param parameters - Chain registry or array and criteria to filter by.
 * @returns Matching chains.
 */
export function filterChains<const criteria extends filterChains.Criteria>(
  parameters: FilterChainsParameters<criteria>,
): FilterChainsReturnType<criteria> {
  const { chains, sort, testnet, token } = parameters
  const values = Array.isArray(chains) ? chains : Object.values(chains)
  const filtered: Chain[] = []

  for (const chain of values) {
    if (!isChain(chain)) continue
    if (token && !(chain.id in token.addresses)) continue
    if (testnet === true && chain.testnet !== true) continue
    if (testnet === false && chain.testnet === true) continue
    filtered.push(chain)
  }

  if (sort === 'id') filtered.sort((a, b) => a.id - b.id)
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))

  return filtered as never
}

function isChain(chain: unknown): chain is Chain {
  return (
    typeof chain === 'object' &&
    chain !== null &&
    'id' in chain &&
    typeof chain.id === 'number' &&
    'name' in chain &&
    typeof chain.name === 'string' &&
    'nativeCurrency' in chain &&
    'rpcUrls' in chain
  )
}

export namespace filterChains {
  export type Chains = Record<string, unknown> | readonly unknown[]

  export type Criteria = {
    /** Only include chains that have an address for the token. */
    token?: Token | undefined
    /** Only include testnets (`true`) or mainnets (`false`). */
    testnet?: boolean | undefined
    /** Sort the matching chains. */
    sort?: 'id' | 'name' | undefined
  }

  export type ReturnType<criteria extends Criteria | undefined> =
    FilterChainsReturnType<criteria>

  export type TokenConstraint<criteria extends Criteria | undefined> =
    criteria extends { token: infer token extends Token }
      ? { id: Extract<keyof token['addresses'], number> }
      : unknown

  export type TestnetConstraint<criteria extends Criteria | undefined> =
    criteria extends { testnet: infer testnet extends boolean }
      ? testnet extends true
        ? { testnet: true }
        : { testnet?: false | undefined }
      : unknown
}
