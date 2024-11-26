import { defineChain } from '../../utils/chain/defineChain.js'

export const iSunCoin = /*#__PURE__*/ defineChain({
  id: 8017,
  name: 'iSunCoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ISC',
    symbol: 'ISC',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.isuncoin.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'iSunCoin Explorer',
      url: 'https://baifa.io/app/chains/8017',
    },
  },
})
