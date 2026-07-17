import * as Chain from '../../core/Chain.js'

export const zeniq = /*#__PURE__*/ Chain.from({
  id: 383414847825,
  name: 'Zeniq Mainnet',
  nativeCurrency: { name: 'ZENIQ', symbol: 'ZENIQ', decimals: 18 },
  rpcUrls: {
    http: 'https://api.zeniq.network',
  },
  blockExplorers: {
    name: 'Zeniq Explorer',
    url: 'https://zeniqscan.com',
  },
  testnet: false,
})
