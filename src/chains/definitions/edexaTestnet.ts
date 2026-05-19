import * as Chain from '../../core/Chain.js'

export const edexaTestnet = /*#__PURE__*/ Chain.define({
  id: 1995n,
  name: 'edeXa Testnet',
  nativeCurrency: { name: 'edeXa', symbol: 'tEDX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.edexa.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'edeXa Testnet Explorer',
      url: 'https://explorer.testnet.edexa.network',
      apiUrl: 'https://explorer.testnet.edexa.network/api/v2',
    },
  },
  testnet: true,
})
