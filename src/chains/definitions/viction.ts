import * as Chain from '../../core/Chain.js'

export const viction = /*#__PURE__*/ Chain.define({
  id: 88n,
  name: 'Viction',
  nativeCurrency: { name: 'Viction', symbol: 'VIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.viction.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VIC Scan',
      url: 'https://vicscan.xyz',
    },
  },
  testnet: false,
})
