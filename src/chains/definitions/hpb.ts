import * as Chain from '../../core/Chain.js'

export const hpb = /*#__PURE__*/ Chain.from({
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
