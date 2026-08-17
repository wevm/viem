import * as Chain from '../../core/Chain.js'

export const abey = /*#__PURE__*/ Chain.from({
  id: 179,
  name: 'ABEY Mainnet',
  nativeCurrency: { name: 'ABEY', symbol: 'ABEY', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.abeychain.com',
  },
  blockExplorers: {
    name: 'Abey Scan',
    url: 'https://abeyscan.com',
  },
  testnet: false,
})
