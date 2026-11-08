import * as Chain from '../../core/Chain.js'

export const bitkubTestnet = /*#__PURE__*/ Chain.from({
  id: 25925,
  name: 'Bitkub Testnet',
  nativeCurrency: { name: 'Bitkub Test', symbol: 'tKUB', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-testnet.bitkubchain.io',
  },
  blockExplorers: {
    name: 'Bitkub Chain Testnet Explorer',
    url: 'https://testnet.bkcscan.com',
    apiUrl: 'https://testnet.bkcscan.com/api',
  },
  testnet: true,
})
