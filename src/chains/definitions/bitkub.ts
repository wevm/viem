import * as Chain from '../../core/Chain.js'

export const bitkub = /*#__PURE__*/ Chain.from({
  id: 96,
  name: 'KUB Mainnet',
  nativeCurrency: { name: 'KUB Coin', symbol: 'KUB', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.bitkubchain.io',
  },
  blockExplorers: {
    name: 'KUB Chain Mainnet Explorer',
    url: 'https://www.bkcscan.com',
    apiUrl: 'https://www.bkcscan.com/api',
  },
})
