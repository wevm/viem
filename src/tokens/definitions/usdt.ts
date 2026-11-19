import { defineToken } from '../defineToken.js'

/**
 * [USDT](https://tether.to) (Tether USD) token, with canonical contract
 * addresses across supported chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * [token config](/tokens/guides/defining-tokens), or read the metadata and `addresses`
 * map directly.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { usdt } from 'viem/tokens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   tokens: [usdt],
 *   transport: http(),
 * })
 * ```
 *
 * @example
 * ```ts
 * import { usdt } from 'viem/tokens'
 *
 * usdt.addresses[1]
 * // '0xdAC17F958D2ee523a2206206994597C13D831ec7'
 * ```
 */
export const usdt = /*#__PURE__*/ defineToken({
  addresses: {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // mainnet
    42220: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', // celo
    43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // avalanche
  },
  currency: 'USD',
  decimals: 6,
  name: 'Tether USD',
  popular: true,
  symbol: 'USDT',
})
