import { defineChain } from '../../utils/chain/defineChain.js'

export const datahavenTestnet = /*#__PURE__*/ defineChain({
  id: 55931,
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
