import * as Chain from '../../core/Chain.js'

export const bsquaredTestnet = /*#__PURE__*/ Chain.define({
  id: 1123n,
  name: 'B2 Testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.bsquared.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://testnet-explorer.bsquared.network',
    },
  },
  testnet: true,
})
