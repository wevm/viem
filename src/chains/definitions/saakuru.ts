import * as Chain from '../../core/Chain.js'

export const saakuru = /*#__PURE__*/ Chain.define({
  id: 7225878n,
  name: 'Saakuru Mainnet',
  nativeCurrency: { name: 'OAS', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.saakuru.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saakuru Explorer',
      url: 'https://explorer.saakuru.network',
    },
  },
  testnet: false,
})
