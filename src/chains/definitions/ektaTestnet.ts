import { defineChain } from '../../utils/chain/defineChain.js'

export const ektaTestnet = /*#__PURE__*/ defineChain({
  id: 1004,
  name: 'Ekta Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EKTA',
    symbol: 'EKTA',
  },
  rpcUrls: {
    default: { http: ['https://test.ekta.io:8545'] },
  },
  blockExplorers: {
    default: {
      name: 'Test Ektascan',
      url: 'https://test.ektascan.io',
      apiUrl: 'https://test.ektascan.io/api',
    },
  },
  testnet: true,
})
