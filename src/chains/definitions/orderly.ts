import * as Chain from '../../core/Chain.js'

export const orderly = /*#__PURE__*/ Chain.define({
  id: 291n,
  name: 'Orderly',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.orderly.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Orderly Explorer',
      url: 'https://explorer.orderly.network',
    },
  },
  testnet: false,
})
