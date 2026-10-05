import * as Chain from '../../core/Chain.js'

export const saakuru = /*#__PURE__*/ Chain.from({
  id: 7225878,
  name: 'Saakuru Mainnet',
  nativeCurrency: { name: 'OAS', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.saakuru.network',
  },
  blockExplorers: {
    name: 'Saakuru Explorer',
    url: 'https://explorer.saakuru.network',
  },
  testnet: false,
})
