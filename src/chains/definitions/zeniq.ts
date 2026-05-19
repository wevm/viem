import * as Chain from '../../core/Chain.js'

export const zeniq = /*#__PURE__*/ Chain.define({
  id: 383414847825n,
  name: 'Zeniq Mainnet',
  nativeCurrency: { name: 'ZENIQ', symbol: 'ZENIQ', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.zeniq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zeniq Explorer',
      url: 'https://zeniqscan.com',
    },
  },
  testnet: false,
})
