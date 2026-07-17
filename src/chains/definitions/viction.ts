import * as Chain from '../../core/Chain.js'

export const viction = /*#__PURE__*/ Chain.from({
  id: 88,
  name: 'Viction',
  nativeCurrency: { name: 'Viction', symbol: 'VIC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.viction.xyz',
  },
  blockExplorers: {
    name: 'VIC Scan',
    url: 'https://vicscan.xyz',
  },
  testnet: false,
})
