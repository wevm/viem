import * as Chain from '../../core/Chain.js'

export const aioz = /*#__PURE__*/ Chain.from({
  id: 168,
  name: 'AIOZ Network',
  nativeCurrency: {
    decimals: 18,
    name: 'AIOZ',
    symbol: 'AIOZ',
  },
  rpcUrls: {
    default: {
      http: ['https://eth-dataseed.aioz.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'AIOZ Explorer',
      url: 'https://explorer.aioz.network',
    },
  },
  testnet: false,
})
