import type { Address } from 'abitype'

/**
 * A token created by {@link defineToken}: callable with a chain id to produce a
 * chain-specific token config, and exposing the token metadata
 * (`currency`, `decimals`, `name`, `popular`, `symbol`) and the full
 * `addresses` map.
 */
export type Token<
  token extends defineToken.Parameters = defineToken.Parameters,
> = defineToken.ReturnType<token>

/** Collection of tokens to declare on a Client. */
export type Tokens = readonly Token[]

/** A {@link Token} resolved to a specific chain id. */
export type ResolvedToken = {
  /** Token contract address. */
  address: Address
  /** Token currency denomination. */
  currency?: string | undefined
  /** Token decimals, used to parse human-readable `amount` strings. */
  decimals: number
  /** Token name. */
  name?: string | undefined
  /** Whether the token should be treated as popular in token lists. */
  popular?: boolean | undefined
  /** Token symbol. */
  symbol?: string | undefined
}

/**
 * Creates a token from shared metadata (`currency`, `decimals`, `name`,
 * `popular`, `symbol`) and a map of per-chain contract `addresses`. The
 * returned value is callable with a chain id to produce a chain-specific token
 * config while also exposing the metadata and the full `addresses` map.
 *
 * @param token - {@link defineToken.Parameters}
 * @returns The token. {@link defineToken.ReturnType}
 *
 * @example
 * ```ts
 * import { defineToken } from 'viem/tokens'
 *
 * const usdc = defineToken({
 *   addresses: {
 *     1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 *     8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
 *   },
 *   currency: 'USD',
 *   decimals: 6,
 *   name: 'USD Coin',
 *   popular: true,
 *   symbol: 'USDC',
 * })
 *
 * usdc(1)
 * // {
 * //   address: '0xA0b8…48',
 * //   currency: 'USD',
 * //   decimals: 6,
 * //   name: 'USD Coin',
 * //   popular: true,
 * //   symbol: 'USDC',
 * // }
 *
 * usdc.addresses[8453]
 * // '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
 * ```
 */
export function defineToken<const token extends defineToken.Parameters>(
  token: token,
): defineToken.ReturnType<token> {
  const { addresses, currency, decimals, name, popular, symbol } = token
  function fn(chainId: number): ResolvedToken {
    const address = (addresses as Record<number, Address>)[chainId]
    if (!address)
      throw new Error(`Token has no address for chain id "${chainId}".`)
    return { address, currency, decimals, name, popular, symbol }
  }
  return Object.defineProperties(fn, {
    addresses: { enumerable: true, value: addresses },
    currency: { enumerable: true, value: currency },
    decimals: { enumerable: true, value: decimals },
    name: { enumerable: true, value: name },
    popular: { enumerable: true, value: popular },
    symbol: { enumerable: true, value: symbol },
  }) as never
}

export namespace defineToken {
  type ParameterValue<
    token extends Parameters,
    key extends keyof Parameters,
  > = token extends { [_ in key]?: infer value } ? value : undefined

  export type Parameters<
    addresses extends Record<number, Address> = Record<number, Address>,
  > = {
    /** Token contract addresses, keyed by chain id. */
    addresses: addresses
    /** Currency denomination of the token (e.g. `'USD'`). */
    currency?: string | undefined
    /** Number of decimals the token uses. */
    decimals: number
    /** Human-readable name of the token. */
    name?: string | undefined
    /** Whether the token should be treated as popular in token lists. */
    popular?: boolean | undefined
    /** Ticker symbol of the token. */
    symbol?: string | undefined
  }

  export type ReturnType<token extends Parameters = Parameters> = {
    /**
     * Resolves the token config (`address`, `currency`, `decimals`, `name`,
     * `popular`, `symbol`) for a chain id.
     */
    <chainId extends keyof token['addresses']>(
      chainId: chainId,
    ): {
      address: token['addresses'][chainId]
      currency: ParameterValue<token, 'currency'>
      decimals: token['decimals']
      name: ParameterValue<token, 'name'>
      popular: ParameterValue<token, 'popular'>
      symbol: ParameterValue<token, 'symbol'>
    }
    /** Token contract addresses, keyed by chain id. */
    addresses: token['addresses']
    /** Currency denomination of the token (e.g. `'USD'`). */
    currency: ParameterValue<token, 'currency'>
    /** Number of decimals the token uses. */
    decimals: token['decimals']
    /** Human-readable name of the token. */
    name: ParameterValue<token, 'name'>
    /** Whether the token should be treated as popular in token lists. */
    popular: ParameterValue<token, 'popular'>
    /** Ticker symbol of the token. */
    symbol: ParameterValue<token, 'symbol'>
  }
}
