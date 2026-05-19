import * as Chain from '../../core/Chain.js'

export const abey = /*#__PURE__*/ Chain.define({
  id: 179n,
  name: 'ABEY Mainnet',
  nativeCurrency: { name: 'ABEY', symbol: 'ABEY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.abeychain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Abey Scan',
      url: 'https://abeyscan.com',
    },
  },
  testnet: false,
})
