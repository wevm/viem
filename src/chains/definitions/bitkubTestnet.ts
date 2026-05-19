import * as Chain from '../../core/Chain.js'

export const bitkubTestnet = /*#__PURE__*/ Chain.define({
  id: 25925n,
  name: 'Bitkub Testnet',
  network: 'Bitkub Testnet',
  nativeCurrency: { name: 'Bitkub Test', symbol: 'tKUB', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.bitkubchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitkub Chain Testnet Explorer',
      url: 'https://testnet.bkcscan.com',
      apiUrl: 'https://testnet.bkcscan.com/api',
    },
  },
  testnet: true,
})
