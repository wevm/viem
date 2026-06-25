import type { Abi, Address } from 'abitype'
import type { Prettify } from '../types/utils.js'

/**
 * Defines a token with typed metadata and chain-specific addresses.
 *
 * @example
 * ```ts
 * import { erc20Abi } from 'viem'
 * import { base } from 'viem/chains'
 * import { defineToken } from 'viem/tokens'
 *
 * const token = defineToken({
 *   name: 'Example Token',
 *   symbol: 'EXT',
 *   decimals: 18,
 *   abi: erc20Abi,
 *   addresses: {
 *     [base.id]: '0x...',
 *   },
 * })
 *
 * const address = token.address(base)
 * ```
 */
export function defineToken<
  const abi extends Abi | readonly unknown[],
  const addresses extends TokenAddresses,
  const name extends string,
  const tokenSymbol extends string,
  const decimals extends number,
>(
  token: DefineTokenParameters<abi, addresses, name, tokenSymbol, decimals>,
): Token<abi, addresses, name, tokenSymbol, decimals> {
  return {
    ...token,
    address(source) {
      const chainId = getChainId(source)
      return token.addresses[chainId]
    },
    config(source) {
      const chainId = getChainId(source)
      return {
        address: token.addresses[chainId],
        abi: token.abi,
      }
    },
  } as Token<abi, addresses, name, tokenSymbol, decimals>
}

function getChainId(
  source: number | { id: number } | { chain: { id: number } },
) {
  if (typeof source === 'number') return source
  if ('chain' in source) return source.chain.id
  return source.id
}

export type DefineTokenParameters<
  abi extends Abi | readonly unknown[] = Abi,
  addresses extends TokenAddresses = TokenAddresses,
  name extends string = string,
  tokenSymbol extends string = string,
  decimals extends number = number,
> = {
  /** Token ABI. */
  abi: abi
  /** Token contract addresses, keyed by chain id. */
  addresses: addresses
  /** Token decimals. */
  decimals: decimals
  /** Token name. */
  name: name
  /** Token symbol. */
  symbol: tokenSymbol
}

export type Token<
  abi extends Abi | readonly unknown[] = Abi,
  addresses extends TokenAddresses = TokenAddresses,
  name extends string = string,
  tokenSymbol extends string = string,
  decimals extends number = number,
> = Prettify<
  DefineTokenParameters<abi, addresses, name, tokenSymbol, decimals> & {
    address: <source extends TokenChainSource<addresses>>(
      source: source,
    ) => addresses[TokenChainId<source>]
    config: <source extends TokenChainSource<addresses>>(
      source: source,
    ) => {
      address: addresses[TokenChainId<source>]
      abi: abi
    }
  }
>

export type TokenAddresses = Record<number, Address>

type TokenChainSource<addresses extends TokenAddresses> =
  | Extract<keyof addresses, number>
  | { id: Extract<keyof addresses, number> }
  | { chain: { id: Extract<keyof addresses, number> } }

type TokenChainId<source> = source extends number
  ? source
  : source extends { id: infer chainId extends number }
    ? chainId
    : source extends { chain: { id: infer chainId extends number } }
      ? chainId
      : never
