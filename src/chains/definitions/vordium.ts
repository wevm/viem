import { defineChain } from '../../utils/chain/defineChain.js'

export const vordium = /*#__PURE__*/ defineChain({
  id: 101_101,
  name: 'Vordium',
  nativeCurrency: { name: 'Vordium', symbol: 'VORD', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.vordium.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VordScan',
      url: 'https://vordscan.io',
      apiUrl: 'https://vordscan.io/api',
    },
  },
})
