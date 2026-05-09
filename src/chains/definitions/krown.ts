import { defineChain } from '../../utils/chain/defineChain.js'

export const krown = /*#__PURE__*/ defineChain({
  id: 1983,
  name: 'Krown',
  nativeCurrency: {
    decimals: 18,
    name: 'Krown',
    symbol: 'KROWN',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.krown.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Krown Explorer',
      url: 'https://explorer.krown.network',
    },
  },
  testnet: false,
})
