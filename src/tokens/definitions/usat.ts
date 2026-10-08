import { defineToken } from '../defineToken.js'

/**
 * [USAT](https://usat.io) (Tether America USD) token, with canonical contract
 * addresses across supported chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * [token config](/docs/chains/tokens), or read the metadata and `addresses`
 * map directly.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from 'viem'
 * import { celo } from 'viem/chains'
 * import { usat } from 'viem/tokens'
 *
 * const client = createPublicClient({
 *   chain: celo,
 *   tokens: [usat],
 *   transport: http(),
 * })
 * ```
 *
 * @example
 * ```ts
 * import { usat } from 'viem/tokens'
 *
 * usat.addresses[42220]
 * // '0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771'
 * ```
 */
export const usat = /*#__PURE__*/ defineToken({
  addresses: {
    42220: '0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771', // celo
  },
  currency: 'USD',
  decimals: 6,
  name: 'Tether America USD',
  symbol: 'USAT',
})
