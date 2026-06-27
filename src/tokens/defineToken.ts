import type { Address } from 'abitype'
import type { ChainToken } from '../types/chain.js'

/**
 * A token created by {@link defineToken}: callable with a chain id to produce a
 * [token config](/docs/chains/tokens), and exposing the token metadata
 * (`decimals`, `name`, `symbol`) and the full `addresses` map.
 */
export type Token<
  token extends defineToken.Parameters = defineToken.Parameters,
> = defineToken.ReturnType<token>

/**
 * Creates a token from shared metadata (`decimals`, `name`, `symbol`) and a map
 * of per-chain contract `addresses`. The returned value is callable with a
 * chain id to produce a [token config](/docs/chains/tokens) for that chain's
 * `tokens` field, and also exposes the metadata and the full `addresses` map.
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
 *   decimals: 6,
 *   name: 'USD Coin',
 *   symbol: 'USDC',
 * })
 *
 * usdc(1)
 * // { address: '0xA0b8…48', decimals: 6, name: 'USD Coin', symbol: 'USDC' }
 *
 * usdc.addresses[8453]
 * // '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
 * ```
 */
export function defineToken<const token extends defineToken.Parameters>(
  token: token,
): defineToken.ReturnType<token> {
  const { addresses, decimals, name, symbol } = token
  function fn(chainId: number): ChainToken {
    const address = (addresses as Record<number, Address>)[chainId]
    if (!address)
      throw new Error(`Token has no address for chain id "${chainId}".`)
    return { address, decimals, name, symbol }
  }
  return Object.defineProperties(fn, {
    addresses: { enumerable: true, value: addresses },
    decimals: { enumerable: true, value: decimals },
    name: { enumerable: true, value: name },
    symbol: { enumerable: true, value: symbol },
  }) as never
}

export namespace defineToken {
  export type Parameters<
    addresses extends Record<number, Address> = Record<number, Address>,
  > = {
    /** Token contract addresses, keyed by chain id. */
    addresses: addresses
    /** Number of decimals the token uses. */
    decimals: number
    /** Human-readable name of the token. */
    name?: string | undefined
    /** Ticker symbol of the token. */
    symbol?: string | undefined
  }

  export type ReturnType<token extends Parameters = Parameters> = {
    /**
     * Resolves the token config (`address`, `decimals`, `name`, `symbol`) for a
     * chain id, for use in a chain's `tokens` field.
     */
    <chainId extends keyof token['addresses']>(
      chainId: chainId,
    ): {
      address: token['addresses'][chainId]
      decimals: token['decimals']
      name: token['name']
      symbol: token['symbol']
    }
    /** Token contract addresses, keyed by chain id. */
    addresses: token['addresses']
    /** Number of decimals the token uses. */
    decimals: token['decimals']
    /** Human-readable name of the token. */
    name: token['name']
    /** Ticker symbol of the token. */
    symbol: token['symbol']
  }
}
