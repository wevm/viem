import { defineChain } from '../../utils/chain/defineChain.js'

export const hpb = /*#__PURE__*/ defineChain({
  id: 269,
  name: 'High Performance Blockchain',
  nativeCurrency: { name: 'HPB', symbol: 'HPB', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://hpbnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'hpbScan',
      url: 'https://hscan.org',
    },
  },
  testnet: false,
})
