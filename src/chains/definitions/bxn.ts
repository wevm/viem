import * as Chain from '../../core/Chain.js'

export const bxn = /*#__PURE__*/ Chain.define({
  id: 4999n,
  name: 'BlackFort Exchange Network',
  nativeCurrency: { name: 'BlackFort Token', symbol: 'BXN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.blackfort.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.blackfort.network',
      apiUrl: 'https://explorer.blackfort.network/api',
    },
  },
})
