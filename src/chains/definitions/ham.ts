import * as Chain from '../../core/Chain.js'

export const ham = /*#__PURE__*/ Chain.define({
  id: 5112n,
  name: 'Ham',
  nativeCurrency: {
    decimals: 18,
    name: 'Ham',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ham.fun'],
      webSocket: ['wss://rpc.ham.fun'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ham Chain Explorer',
      url: 'https://explorer.ham.fun',
      apiUrl: 'https://explorer.ham.fun/api/v2',
    },
  },
})
