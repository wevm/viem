import * as Chain from '../../core/Chain.js'

export const orderly = /*#__PURE__*/ Chain.from({
  id: 291,
  name: 'Orderly',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'https://rpc.orderly.network' },
  blockExplorers: {
    name: 'Orderly Explorer',
    url: 'https://explorer.orderly.network',
  },
  testnet: false,
})
