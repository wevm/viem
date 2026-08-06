import { defineToken } from '../defineToken.js'

/**
 * [USDT](https://tether.to) (Tether USD) token, with canonical contract
 * addresses across supported chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * [token config](/docs/chains/tokens), or read the metadata and `addresses`
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
    10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // optimism
    8453: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // base
    42220: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', // celo
    43114: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // avalanche
    59144: '0xA219439258ca9da29E9Cc4cE5596924745e12B93', // linea
    534352: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df', // scroll
  },
  currency: 'USD',
  decimals: 6,
  name: 'Tether USD',
  popular: true,
  symbol: 'USDT',
})
