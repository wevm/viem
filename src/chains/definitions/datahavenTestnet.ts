import * as Chain from '../../core/Chain.js'

export const datahavenTestnet = /*#__PURE__*/ Chain.define({
  id: 55931n,
  name: 'Datahaven Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MOCK',
    symbol: 'MOCK',
  },
  rpcUrls: {
    default: {
      http: ['https://services.datahaven-testnet.network/testnet'],
      webSocket: ['wss://services.datahaven-testnet.network/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DhScan',
      url: 'https://testnet.dhscan.io/',
      apiUrl: 'https://testnet.dhscan.io/api-docs',
    },
  },
  contracts: {},
  testnet: true,
})
