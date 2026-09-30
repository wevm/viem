import { defineToken } from '../defineToken.js'

/**
 * [Open USD](https://joinopenstandard.com/) token, with canonical contract
 * addresses on Ethereum, Tempo, and Base.
 *
 * @example
 * ```ts
 * import { ousd } from 'viem/tokens'
 *
 * ousd(4217)
 * // { address: '0x20c0000000000000000000006a37DA5C996874BE', ... }
 * ```
 */
export const ousd = /*#__PURE__*/ defineToken({
  addresses: {
    1: '0x9f6F3991D525015a6F8CaF062C83b62fD3AC4436', // mainnet
    4217: '0x20c0000000000000000000006a37DA5C996874BE', // tempo
    8453: '0xB2000000000000000000002fEb517dFeC7415344', // base
  },
  currency: 'USD',
  decimals: 6,
  name: 'OpenUSD',
  popular: true,
  symbol: 'OUSD',
})
